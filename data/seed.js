const dbConnection = require('../data/mongoConnection');
const data = require('../data');
const users = data.users;
const events = data.events;

const main = async () => {
  const db = await dbConnection();
  await db.dropDatabase();

  //admin login
  Admin={
    loginID: 'admin',
    email: 'null',
    password: 'test12345',
    firstName: 'Admin',
    lastName: 'Owner',
    location: '08536',
    regdEvents: []
  }
  //Tour guide
  tguide={
    loginID: 'tguide',
    email: 'null1',
    password: 'test1234',
    firstName: 'Harsha',
    lastName: 'Konda',
    location: '07082',
    regdEvents: []
  }
  //User
  user={
    loginID: 'vaishnavi',
    email: 'null2',
    password: 'test123',
    firstName: 'Vaishnavi',
    lastName: 'Gopal',
    location: '07030',
    regdEvents: []
  }
  await users.createUser(Admin,3);
  let tourg = await users.createUser(tguide,2);
  await users.createUser(user,1);
  var date = new Date();
  
  let newEvent = {
    eventName : 'Hiking',
    eventDesc : 'Appalachian Hiking',
    location : '10988',
    tourGuide : 'Harsha',
    price : '$200',
    maxUsers: 20,
    eventDate: date.setDate(date.getDate() + 1),
    eventStatus: 'open'
  }

  await events.createEvent(newEvent,tourg._id.toString())

 newEvent = {
    eventName : 'Rafting',
    eventDesc : 'Rafting down the Hudson',
    location : '12550',
    tourGuide : 'Harsha',
    price : '$150',
    maxUsers: 10,
    eventDate: date.setDate(date.getDate() + 9),
    eventStatus: 'open'
  }

  await events.createEvent(newEvent,tourg._id.toString())

  newEvent = {
    eventName : 'Bungee Jumping',
    eventDesc : 'Jump from the top',
    location : '18327',
    tourGuide : 'Vaishnavi',
    price : '$100',
    maxUsers: 1,
    eventDate: date.setDate(date.getDate() + 12),
    eventStatus: 'open'
  }

  await events.createEvent(newEvent,tourg._id.toString())
  

  console.log('Done seeding the database');
  await db.serverConfig.close();
};

main().catch(console.log);