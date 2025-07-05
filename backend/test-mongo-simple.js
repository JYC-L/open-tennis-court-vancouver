const { MongoClient } = require('mongodb');

async function testMongoConnection() {
  const uri = "mongodb+srv://vancouver-tennis:cpsc445-team16@cluster0.rro8xzs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  
  console.log('Testing MongoDB connection...');
  console.log('URI:', uri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
  
  const options = {
    ssl: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 20000,
  };
  
  try {
    const client = new MongoClient(uri, options);
    console.log('Attempting to connect with TLS options...');
    await client.connect();
    console.log('✅ Connection successful!');
    
    const db = client.db('Vancouver-tennis-court-availability');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    await client.close();
    console.log('✅ Connection closed');
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    if (error.cause) {
      console.error('Cause:', error.cause.message);
      console.error('Cause code:', error.cause.code);
    }
  }
}

testMongoConnection(); 