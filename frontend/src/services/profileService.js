import { db } from "../conf/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

/**
 * Fetches the user profile from Firestore.
 * @param {string} uid - The user's authentication ID.
 * @returns {Promise<Object|null>} The user data or null if not found.
 */
export const getUserProfile = async (uid) => {
  if (!uid) return null;
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

/**
 * Updates or creates a user profile in Firestore.
 * Performs a merge update, so unrelated fields are not overwritten.
 * @param {string} uid - The user's authentication ID.
 * @param {Object} data - The data fields to update.
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (uid, data) => {
  if (!uid) return;
  try {
    const docRef = doc(db, "users", uid);
    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Records a profile view (Prevents spam by overwriting timestamp for the same viewer)
 * @param {string} targetUid - The ID of the profile being viewed.
 * @param {Object} viewerData - Object containing viewer details ({ uid, name, photoUrl/photoURL, department }).
 * @returns {Promise<void>}
 */
export const recordProfileView = async (targetUid, viewerData) => {
  if (!targetUid || !viewerData?.uid || targetUid === viewerData.uid) return;

  try {
    const viewRef = doc(db, "users", targetUid, "views", viewerData.uid);
    await setDoc(
      viewRef,
      {
        viewerUid: viewerData.uid,
        viewerName: viewerData.name || "Anonymous Student",
        viewerPhoto: viewerData.photoUrl || viewerData.photoURL || "",
        viewerBranch: viewerData.department || viewerData.branch || viewerData.major || "",
        viewedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error recording profile view:", error);
  }
};

/**
 * Real-time listener for profile viewers (returns the 20 most recent viewers)
 * @param {string} userId - The profile owner's UID.
 * @param {Function} callback - Callback function receiving the list of viewers.
 * @returns {Unsubscribe} Firestore listener unsubscribe function.
 */
export const subscribeToProfileViews = (userId, callback) => {
  if (!userId) return () => {};

  const viewsRef = collection(db, "users", userId, "views");
  const q = query(viewsRef, orderBy("viewedAt", "desc"), limit(20));

  return onSnapshot(
    q,
    (snapshot) => {
      const viewers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(viewers);
    },
    (error) => {
      console.error("Error subscribing to profile views:", error);
    }
  );
};

/**
 * Searches users based on branch/department and matching skills for study/project partners
 * @param {Object} params - Search filter parameters
 * @param {string} [params.branch] - Branch or department to filter by ("All" or undefined for all branches)
 * @param {Array<string>} [params.skills] - Array of required skill strings
 * @param {string} params.currentUid - The active user's UID to exclude from search results
 * @returns {Promise<Array<Object>>} Array of matching user profile objects
 */
export const findPartners = async ({
  branch,
  skills = [],
  currentUid,
  blockedUsers = [],
}) => {
  try {
    const usersRef = collection(db, "users");
    let q = query(usersRef);

    const snapshot = await getDocs(q);
    const normalizedSkills = normalizeList(skills).map((skill) =>
      skill.toLowerCase()
    );

    let results = snapshot.docs
      .map((doc) => ({ uid: doc.id, ...doc.data() }))
      .filter((user) => user.uid !== currentUid)
      .filter((user) => !blockedUsers.includes(user.uid))
      .filter((user) => !(user.blockedUsers || []).includes(currentUid));

    if (branch && branch !== "All") {
      results = results.filter((user) => {
        const userBranch = user.branch || user.department || user.DEPT || "";
        return userBranch === branch;
      });
    }

    if (normalizedSkills.length > 0) {
      results = results.filter((user) => {
        const userSkills = normalizeList(user.skills).map((skill) =>
          skill.toLowerCase()
        );
        return normalizedSkills.some((skill) => userSkills.includes(skill));
      });
    }

    return results;
  } catch (error) {
    console.error("Error finding study/project partners:", error);
    throw error;
  }
};

/**
 * Blocks a user by adding their UID to the current user's `blockedUsers` array
 * @param {string} currentUid - Active user's UID
 * @param {string} blockedUid - Target user's UID to block
 */
export const blockUser = async (currentUid, blockedUid) => {
  if (!currentUid || !blockedUid) return;
  try {
    const userRef = doc(db, "users", currentUid);
    await updateDoc(userRef, {
      blockedUsers: arrayUnion(blockedUid),
    });
  } catch (error) {
    console.error("Error blocking user:", error);
    throw error;
  }
};

/**
 * Unblocks a user by removing their UID from the current user's `blockedUsers` array
 * @param {string} currentUid - Active user's UID
 * @param {string} blockedUid - Target user's UID to unblock
 */
export const unblockUser = async (currentUid, blockedUid) => {
  if (!currentUid || !blockedUid) return;
  try {
    const userRef = doc(db, "users", currentUid);
    await updateDoc(userRef, {
      blockedUsers: arrayRemove(blockedUid),
    });
  } catch (error) {
    console.error("Error unblocking user:", error);
    throw error;
  }
};

/**
 * Submits a community report against a user
 * @param {string} reporterUid - Active user's UID
 * @param {string} reportedUid - Target user's UID being reported
 * @param {string} reason - Detailed text reason for report
 */
export const reportUser = async (reporterUid, reportedUid, reason) => {
  if (!reporterUid || !reportedUid || !reason) return;
  try {
    const reportsRef = collection(db, "reports");
    await addDoc(reportsRef, {
      reporterUid,
      reportedUid,
      reason: reason.trim(),
      createdAt: serverTimestamp(),
      status: "pending",
    });
  } catch (error) {
    console.error("Error submitting user report:", error);
    throw error;
  }
};
