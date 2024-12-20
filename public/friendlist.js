import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc,
    updateDoc,
    getDoc,
    deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const db = getFirestore();
const auth = getAuth();

// DOM Elements
const friendsIcon = document.getElementById('friendsIcon');
const friendsModal = document.getElementById('friendsModal');
const closeFriendsModal = document.getElementById('closeFriendsModal');

const friendsTab = document.getElementById('friendsTab');
const addFriendsTab = document.getElementById('addFriendsTab');
const friendsList = document.getElementById('friendsList');
const addFriends = document.getElementById('addFriends');
const friendsRequestContainer = document.getElementById('friendsRequestContainer');
const friendsListContainer = document.getElementById('friendsListContainer');
const searchFriendInput = document.getElementById('searchFriend');
const searchFriendBtn = document.getElementById('searchFriendBtn');
const searchResults = document.getElementById('searchResults');

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === friendsModal) friendsModal.classList.remove('show');
});

// Open modal
friendsIcon.addEventListener('click', () => {
    friendsModal.classList.add('show');
    friendsTab.click();
});

// Close modal
closeFriendsModal.addEventListener('click', () => {
    friendsModal.classList.remove('show');
});

// Switch tabs
friendsTab.addEventListener('click', () => {
    fetchFriends();
    switchTab(friendsTab, addFriendsTab, friendsList, addFriends);
    fetchFriendRequests(); // Load friend requests when switching to the Friends tab
});

addFriendsTab.addEventListener('click', () => {
    switchTab(addFriendsTab, friendsTab, addFriends, friendsList);
});

function switchTab(activeTab, inactiveTab, activeContent, inactiveContent) {
    activeTab.classList.add('active');
    inactiveTab.classList.remove('active');

    activeContent.style.opacity = 0;
    setTimeout(() => {
        activeContent.style.opacity = 1;
        activeContent.style.display = 'block';
        inactiveContent.style.display = 'none';
    }, 150);
}

// ------------------ Fetch Friends ------------------
async function fetchFriendRequests() {
    const user = auth.currentUser;
    if (!user) return;

    const friendRequestsRef = collection(db, 'friendRequests');
    const q = query(friendRequestsRef, where('receiverUid', '==', user.uid), where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);

    friendsRequestContainer.innerHTML = ''; // Clear old requests

    for (const doc of querySnapshot.docs) {
        const request = doc.data();
        const div = document.createElement('div');
        div.classList.add('request-container');
        const username = await getUsername(request.senderUid);

        div.innerHTML = `
        <p>${username} has sent you a friend request.</p>
        <button class="acceptRequest submit-form" data-uid="${request.senderUid}">Accept</button>
        <button class="declineRequest submit-form" data-uid="${request.senderUid}">Decline</button>
      `;

        friendsRequestContainer.appendChild(div);

        // Attach event listeners
        div.querySelector('.acceptRequest').addEventListener('click', async () => {
            await handleFriendRequest(request.senderUid, true);
        });

        div.querySelector('.declineRequest').addEventListener('click', async () => {
            await handleFriendRequest(request.senderUid, false);
        });
    }
}


// ------------------ Search Users and Send Requests ------------------
searchFriendInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchFriendBtn.click();
    }
});

searchFriendBtn.addEventListener('click', async () => {
    const searchFriend = searchFriendInput.value.trim();
    if (!searchFriend) return;

    const usersRef = collection(db, 'Users');
    const q = query(usersRef, where('username', '>=', searchFriend), where('username', '<=', searchFriend + '\uf8ff'));
    const querySnapshot = await getDocs(q);

    searchResults.innerHTML = ''; // Clear old results

    if (querySnapshot.empty) {
        searchResults.textContent = 'No users found.';
        return;
    }

    const user = auth.currentUser;
    const currentFriendsRef = collection(db, 'Users', user.uid, 'friendList');
    const currentFriendsSnapshot = await getDocs(currentFriendsRef);
    const currentFriendIds = new Set();

    currentFriendsSnapshot.forEach((doc) => {
        currentFriendIds.add(doc.id);
    });

    querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (doc.id === user.uid) return;

        const div = document.createElement('div');
        div.classList.add('search-result');
        div.innerHTML = `
            <p>${userData.username}</p>
            ${currentFriendIds.has(doc.id)
                ? '<button disabled class="submit-form">Already Friends</button>'
                : `<button class="sendRequest submit-form" data-uid="${doc.id}">Send Request</button>`
            }
        `;
        searchResults.appendChild(div);
        //to see if the request is pending or not
        const sendRequestButton = div.querySelector('.sendRequest');
        sendRequestButton?.addEventListener('click', async () => {
            const uid = sendRequestButton.dataset.uid;
            await sendFriendRequest(uid);
    
            // Update button to show "Pending"
            sendRequestButton.textContent = 'Pending';
            sendRequestButton.classList.add('submit-form');
            sendRequestButton.setAttribute('disabled', true);
        });
    });

    document.querySelectorAll('.sendRequest').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const uid = btn.dataset.uid;
            await sendFriendRequest(uid);
        });
    });
});

async function sendFriendRequest(receiverUid) {
    const sender = auth.currentUser;
    if (!sender) return;

    const friendRequestRef = doc(db, 'friendRequests', `${sender.uid}_${receiverUid}`);
    await setDoc(friendRequestRef, {
        senderUid: sender.uid,
        receiverUid,
        status: 'pending',
        timestamp: Date.now(),
    });
}

// ------------------ Handle Friend Requests ------------------
async function handleFriendRequest(uid, accept) {
    const user = auth.currentUser;
    if (!user) return;

    const friendRequestRef = doc(db, 'friendRequests', `${uid}_${user.uid}`);
    const userFriendRef = doc(db, 'Users', user.uid, 'friendList', uid);
    const friendUserRef = doc(db, 'Users', uid, 'friendList', user.uid);

    if (accept) {
        await updateDoc(friendRequestRef, { status: 'accepted' });
        await setDoc(userFriendRef, { username: await getUsername(uid), status: 'active' });
        await setDoc(friendUserRef, { username: user.displayName, status: 'active' });
    } else {
        await updateDoc(friendRequestRef, { status: 'declined' });
    }

    fetchFriendRequests();
    fetchFriends();
}

// ------------------ Helper Functions ------------------
async function getUsername(uid) {
    const userDoc = await getDoc(doc(db, 'Users', uid));
    return userDoc.exists() ? userDoc.data().username : 'Unknown';
}

// ------------------ Fetch and Display Friends ------------------
async function fetchFriends() {
    const user = auth.currentUser;
    if (!user) return;

    const friendsRef = collection(db, 'Users', user.uid, 'friendList');
    const querySnapshot = await getDocs(friendsRef);

    friendsListContainer.innerHTML = ''; // Clear the old friends list

    if (querySnapshot.empty || querySnapshot.docs.length == 1) {
        friendsListContainer.innerHTML = '<p>No friends found.</p>';
        return;
    }

    querySnapshot.forEach((doc) => {
        if(doc.id != "_placeholder"){
        const friendData = doc.data();
        const div = document.createElement('div');
        div.classList.add('friend-item');

        div.innerHTML = `
            <p>${friendData.username}</p>
            <button class="removeFriend submit-form" data-uid="${doc.id}">Remove Friend</button>
        `;

        friendsListContainer.appendChild(div);

        // Attach an event listener to the remove friend button
        div.querySelector('.removeFriend').addEventListener('click', async () => {
            await removeFriend(doc.id);
        });
    }
    });
}

async function removeFriend(friendUid) {
    const user = auth.currentUser;
    if (!user) return;

    const userFriendRef = doc(db, 'Users', user.uid, 'friendList', friendUid);
    const friendUserRef = doc(db, 'Users', friendUid, 'friendList', user.uid);

    // Remove the friend relationship
    await Promise.all([
        deleteDoc(userFriendRef),
        deleteDoc(friendUserRef),
    ]);

    fetchFriends(); // Refresh the friends list
}
