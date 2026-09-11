import { db } from "../conf/firebase";
import {
  doc,
  setDoc,
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  orderBy,
  getDoc,
  Timestamp,
} from "firebase/firestore";

/**
 * Generates a deterministic chatId from two UIDs.
 */
export const getChatId = (uid1, uid2) => {
  return [uid1, uid2].sort().join("_");
};

/**
 * Creates a chat thread if it doesn't already exist.
 */
export const createChat = async (uid1, uid2) => {
  const chatId = getChatId(uid1, uid2);
  const chatRef = doc(db, "chats", chatId);

  try {
    await setDoc(
      chatRef,
      {
        users: [uid1, uid2],
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    const snap = await getDoc(chatRef);
    if (snap.exists() && !snap.data().createdAt) {
      await setDoc(
        chatRef,
        { createdAt: serverTimestamp() },
        { merge: true }
      );
    }

    console.log("Chat initialized/found:", chatId);
    return chatId;
  } catch (err) {
    console.error("Error in createChat service:", err);
    throw err;
  }
};

/**
 * Creates a NEW group chat.
 */
export const createGroupChat = async (
  groupName,
  userIds,
  creatorId,
  isEphemeral = false
) => {
  const chatRef = doc(collection(db, "chats"));
  const chatId = chatRef.id;

  try {
    const chatData = {
      type: isEphemeral ? "ephemeral_group" : "group",
      groupName,
      users: userIds,
      createdBy: creatorId,
      admins: [creatorId],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: `Group "${groupName}" created`,
    };

    if (isEphemeral) {
      chatData.expiresAt = Timestamp.fromDate(
        new Date(Date.now() + 3600000)
      );
    }

    await setDoc(chatRef, chatData);

    console.log("Group Chat created:", chatId);
    return chatId;
  } catch (err) {
    console.error("Error in createGroupChat service:", err);
    throw err;
  }
};

/**
 * Sends a message in a chat thread.
 */
export const sendMessage = async (chatId, senderId, text) => {
  if (!text.trim()) return;

  const messagesRef = collection(db, "chats", chatId, "messages");
  const chatRef = doc(db, "chats", chatId);

  await addDoc(messagesRef, {
    senderId,
    text,
    createdAt: serverTimestamp(),
  });

  await setDoc(
    chatRef,
    {
      lastMessage: text,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

/**
 * Real-time listener for user's active chats.
 * Filters out expired ephemeral group chats as well as chats involving blocked users.
 * 
 * @param {string} currentUid - Active user's UID
 * @param {Array<string>} [blockedUsers=[]] - Array of blocked user UIDs
 * @param {Function} callback - Handler for active chats list
 */
export const getChatsListener = (
  currentUid,
  blockedUsers = [],
  callback
) => {
  // Support flexible argument signatures: getChatsListener(uid, callback) or getChatsListener(uid, blockedUsers, callback)
  let actualBlockedUsers = blockedUsers;
  let actualCallback = callback;

  if (typeof blockedUsers === "function") {
    actualCallback = blockedUsers;
    actualBlockedUsers = [];
  }

  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("users", "array-contains", currentUid));

  return onSnapshot(
    q,
    (snapshot) => {
      const now = new Date();

      const activeChats = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((chat) => {
          // 1. Filter out expired ephemeral group chats
          if (chat.type === "ephemeral_group" && chat.expiresAt) {
            const expiresVal = chat.expiresAt.toDate
              ? chat.expiresAt.toDate()
              : new Date(chat.expiresAt.seconds * 1000);
            if (expiresVal < now) {
              return false;
            }
          }

          // 2. Filter out direct 1-on-1 chats with blocked users
          if (chat.type === "direct" || (!chat.type && chat.users?.length === 2)) {
            const otherUser = chat.users.find((uid) => uid !== currentUid);
            if (otherUser && actualBlockedUsers.includes(otherUser)) {
              return false;
            }
          }

          return true;
        });

      actualCallback(activeChats);
    },
    (error) => {
      console.error("Error in getChatsListener:", error);
      if (error.message.includes("index")) {
        console.warn(
          "CRITICAL: A composite index is required for this query. Check the browser console for a Firebase link to create it."
        );
      }
    }
  );
};

/**
 * Real-time listener for messages in a chat.
 */
export const getMessagesListener = (chatId, callback) => {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
};