const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../../models/chat");


const getSecretRoomId = (userId, targetUserId) => {
    return crypto
      .createHash("sha256")
      .update([userId, targetUserId].sort().join("slkjfa;sdjf$"))
      .digest("hex");
};


const initializeSocket = (server) => {
    
    const io = socket(server , {
        cors: {
            origin: "http://localhost:5173",
        },
    });
    
    io.on("connection" , (socket) => {
        // Handle Events.....
        socket.on("joinChat" , ({firstName , userId , targetUserId}) => {
            const roomId = getSecretRoomId(userId , targetUserId );
            console.log(firstName + " Joined Room : "+roomId);
            socket.join(roomId);
        });
        
        socket.on("sendMessage" , async ({firstName , userId , targetUserId , text}) => {
            const roomId = getSecretRoomId(userId , targetUserId );
            console.log(firstName + " " + text);
            // Save the message to the database here if needed
            try {
                let chat = await Chat.findOne({
                    participants: { $all: [userId , targetUserId] },
                });

                if (!chat) {
                    chat = new Chat({
                        participants: [userId,targetUserId],
                        messages: [],
                    });  
                }

               const newMessage = {
                    senderId: userId,
                    text: text,
                    createdAt: new Date(),
                };

                chat.messages.push(newMessage);
                chat.save()
                    .then(() => {
                        console.log("Message saved to database.");
                    })
                    .catch((err) => {
                        console.error("Error saving message: ", err);
                    });

                io.to(roomId).emit("messageReceived" , {
                    firstName , 
                    text , 
                    timestamp: newMessage.createdAt
                });

            } catch (error) {
                console.error("Error saving message to database: ", error.message);
            }
        });

        socket.on("disconnect" , () => {

        });
    });
}

module.exports = initializeSocket;