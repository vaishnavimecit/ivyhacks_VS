const mongoCollections = require('./mongoCollections');
const users = mongoCollections.users;
const events = require("./events");
const {
  ObjectId
} = require('mongodb');
const bcrypt = require('bcryptjs');

const exportedMethods = {

  async getAllUsers() {
    const usersCollection = await users();
    const allusers = await usersCollection.find({}).toArray();
    return allusers;
  },

  async getUser(id) {
    if(id == undefined) throw "Id doesn't exist"
    else (typeof(id) !== "string")
      id = id.toString();

    const usersCollection = await users();
    const user = await usersCollection.findOne({
      _id: ObjectId(id)
    });
    let allEvents = []

    if (user.regdEvents.length != undefined) {
      for (const event of user.regdEvents) {
        try {
          const info = await events.getEvent(event._id);
          allEvents.push(info);
        } catch (e) {
          console.log(e);
        }
      }
    }
    user.regdEvents = allEvents;

    return user;
  },

  async getUserUpcomming(id) {
    if(id == undefined) throw "Id doesn't exist"
    else (typeof(id) !== "string")
      id = id.toString();

    const usersCollection = await users();
    const user = await usersCollection.findOne({
      _id: ObjectId(id)
    });
    let allEvents = []

    if (user.regdEvents.length != undefined) {
      for (const event of user.regdEvents) {
        let info ={}
        try {
          info = await events.getEvent(event._id);
          var datacheck = new Date().getTime() + (7 * 24 * 60 * 60 * 1000)
          

        } catch (e) {
          console.log(e);
        }
        if (datacheck > info.eventDate && info.eventDate>= new Date()) {
          allEvents.push(info);
        }
      }
    }
    return allEvents;
  },

  async checkReg(id, eid) {
    if(id == undefined || eid == undefined) throw "Id doesn't exist"
    else (typeof(id) !== "string" || typeof(eid) !== "string")
    {
      id = id.toString();
      eid = eid.toString();
    }

    const usersCollection = await users();
    const user = await usersCollection.findOne({
      _id: ObjectId(id)
    });
    if (user.regdEvents.length != undefined) {
      for (const event of user.regdEvents) {

        if (event._id == eid) {
          return true;
        }
      }
    }
    return false;
  },

  async getUserByUsername(uname) {
    if(uname == undefined) throw "User Name doesnt exist"
    else if(typeof uname != 'string') throw "Not a valid name"
    else{
    const userCollection = await users();
    const getUser = await userCollection.findOne({
      loginID: uname
    });
    return getUser;
    }
  },

  async getUsersByEvent(eid) {
    if(eid == undefined) throw "Id doesn't exist"
    else (typeof(eid) !== "string")
      id = id.toString();
    const userCollection = await users();
    const getUsers = await userCollection.find({
      regedEvents: {_id: eid}
    });
    return getUsers;
  },

  async getUserByEmail(useremail) {
    if(useremail == undefined) throw "User eMail doesnt exist"
    else if(typeof useremail != 'string') throw "Not a valid eMail"
    else{
      const userCollection = await users();
      const getUser = await userCollection.findOne({
        email: useremail.toLowerCase()
      });
      return getUser;
    }
  },

  async createUser(userInfo,accesslevel=1) {
    if(!userInfo) throw "No input provided"
    else 
    if(typeof (userInfo.firstName) !== "string" || typeof(userInfo.lastName) !== "string")
    throw "Not valid input"
    else
    {
      var userCollection = await users();
      let hPassword = bcrypt.hashSync(userInfo.password, 4);
      let newUser = {
        loginID: userInfo.loginID.toLowerCase(),
        email: userInfo.email.toLowerCase(),
        hashedPassword: hPassword,
        accessLevel: accesslevel,
        fname: userInfo.firstName,
        lname: userInfo.lastName,
        location: userInfo.location,
        regdEvents: []
    }
    

    if (await this.getUserByUsername(userInfo.loginID.toLowerCase()) || await this.getUserByEmail(userInfo.email.toLowerCase())) {
      throw 'User Exists';
    }
    const insertedUser = await userCollection.insertOne(newUser);
    if (insertedUser.insertedCount == 0)
      throw "Could not add user"

    const Id = insertedUser.insertedId;
    const user = exportedMethods.getUser(Id);
    return user;
    }
  },

  async deleteUser(id) {
    if(id === undefined) throw "Id doesn't exist"
    else (typeof(id) !== "string")
      id = id.toString();
    const usersCollection = await users();
    const deleted = await usersCollection.removeOne({
      _id: ObjectId(id)
    });
    return deleted;
  },
  
  async updateUser(id, update) {
    if(id == undefined) throw "Id doesn't exist"
    else (typeof(id) !== "string")
      id = id.toString();
    
    if (!id || !update) {
      throw "Bad update";
    }
    const usersCollection = await users();
    const updatedUser = {
      $set: update
    };

    const updatedInfo = await usersCollection.updateOne({
      _id: ObjectId(id)
    }, updatedUser);
    console.log(updatedInfo);
    if (updatedInfo.modifiedCount === 0 && updatedInfo.matchedCount != 1) {
      throw "Could not update user";
    }
    return await this.getUser(id);
  },

  async setUserFollowEvent(uid, eid) {
    if(uid == undefined || eid == undefined) throw "Id doesn't exist"
    else (typeof(uid) !== "string" || typeof(eid) !== "string")
      {
        uid = uid.toString();
        eid = eid.toString();
      }
    
    const usersCollection = await users();
    const updatedUser = {
      $addToSet: {
        regdEvents: {
          _id: ObjectId(eid)
        }
      }
    };

    const updatedInfo = await usersCollection.updateOne({
      _id: ObjectId(uid)
    }, updatedUser);
    return updatedInfo;
  },

  async unsetUserFollowEvent(uid, eid) {
    if(uid == undefined || eid == undefined) throw "Id doesn't exist"
    else (typeof(uid) !== "string" || typeof(eid) !== "string")
      {
        uid = uid.toString();
        eid = eid.toString();
      }
    
    const usersCollection = await users();
    const updatedInfo = await usersCollection.updateOne({
      _id: ObjectId(uid)
    }, {
      $pull: {
        regdEvents: {
          '_id': ObjectId(eid)
        }
      }
    });
    return updatedInfo;
  }
};

module.exports = exportedMethods;