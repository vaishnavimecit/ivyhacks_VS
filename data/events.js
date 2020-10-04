const mongoCollections = require('./mongoCollections');
const events = mongoCollections.events;
const users = mongoCollections.users;
const {
  ObjectId
} = require('mongodb');


const exportedMethods = {
  async getAllEvents(past = false) {
    if (past == false) {
      const eventsCollection = await events();

      const allevents = await eventsCollection.find({
        "eventDate": {
          $gte: new Date()
        }
      }).sort({eventDate: 1}).toArray();
      return allevents;
    }
    else{

        const eventsCollection = await events();
  
        const allevents = await eventsCollection.find().sort({eventDate: 1}).toArray();
        return allevents;

    }
  },
  async GeteventUsers(eid){
    if(eid == undefined) throw "Id doesn't exist"
    else if (typeof(eid) !== "string") 
    {
     eid = eid.toString();
      const userCollection = await users();
      const regdUsers= await userCollection.find({regdEvents: {$elemMatch: { _id: ObjectId(eid) }} }).toArray();
      return regdUsers
    }
  },

  async getEvent(id) {
    if (typeof (id) !== "string")
      id = id.toString();

    const eventsCollection = await events();
    let gevent = await eventsCollection.findOne({
      _id: ObjectId(id)
    });
    
    if (!gevent)
      throw "Event Of ID " + id + " Not Found"
    let regdUsers={}
    try{
      regdUsers= await this.GeteventUsers(id);
    }
    catch{
      console.log(e);
    }
    gevent.regdUsers=regdUsers;
    return gevent;
  },

  async createEvent(eventInfo, createdby) {
    if(!eventInfo) throw "No input data"
    else 
    if(typeof (eventInfo.eventName) !== "string" || typeof (eventInfo.tourGuide) !== "string" )
    throw "Input is not in correct format" 
    else if(isNaN(eventInfo.location)) 
      throw "Provide Zip Code!"
    else if(isNaN(eventInfo.maxUsers))
      throw "Provide a number for Maximum users"
    else{
      const eventCollection = await events();

      let newEvent = {
        name: eventInfo.eventName,
        description: eventInfo.eventDesc,
        createdBy: createdby,
        location: eventInfo.location,
        tourGuide: eventInfo.tourGuide,
        price: eventInfo.price,
        maxUsers: eventInfo.maxUsers,
        eventDate: new Date(eventInfo.eventDate),
        eventStatus: eventInfo.eventStatus
      }
      const insertEvent = await eventCollection.insertOne(newEvent);
      if (insertEvent.insertedCount == 0)
        throw "Could not add Event";

      const Id = insertEvent.insertedId;
      const eve = exportedMethods.getEvent(Id);
      return eve;
    }
  },

  async updateEvent(id, update) {
    id = id.toString();
    
    if (!id || !update) {
      throw "No update";
    }
    const eventsCollection = await events();
    const updatedEvent = {
      $set: update
    };

    const updatedInfo = await eventsCollection.updateOne({
      _id: ObjectId(id)
    }, updatedEvent);
    if (updatedInfo.modifiedCount === 0) {
      throw "could not update event";
    }
    return await this.getEvent(id);
  },


  async deleteEvent(id,uid,admin) {
    const eventsCollection = await events();
    const delEvent = await eventsCollection.findOne({
      _id: ObjectId(id)
    });try{
    if( !admin && uid != delEvent.createdBy){
      throw "Not Authorized to Delete"
    }}
    catch{
      console.log(e);
    }

    const deleted = await eventsCollection.removeOne({
      _id: ObjectId(id)
    });
    return delEvent;
  },

  async getTopEvents() {
    const eventsCollection = await events();
    const allevents = await eventsCollection.find({
      "eventDate": {
        $gte: new Date()
      }
    }).sort({eventDate: 1}).toArray();
    return allevents;
  },
  async setRateEvent(id, rate) {
    // Need to work on.
    const eventsCollection = await events();
    const allevents = await eventCollection.find({
      _id: ObjectId(id)
    }).toArray();
    return allevents;
  },


};

module.exports = exportedMethods;