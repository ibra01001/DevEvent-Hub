import 'dotenv/config';
import mongoose from 'mongoose';
import { UserModel } from '../models/User.ts';

void (async () => {
  const users = [
    {
      name: 'Mohamed Remili Admin',
      email: 'mohamedremili5000@gmail.com',
      password: '123456',
      role: 'admin',
      department: 'Platform Administration',
      status: 'active'
    },
    {
      name: 'Mohamed Remili Staff',
      email: 'mohamedremili500@gmail.com',
      password: '123456',
      role: 'staff',
      department: 'Technical Events',
      status: 'active'
    }
  ];

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is missing');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000
  });

  for (const userData of users) {
    const email = userData.email.toLowerCase();
    const existing = await UserModel.findOne({ email });

    if (existing) {
      existing.name = userData.name;
      existing.password = userData.password;
      existing.role = userData.role;
      existing.department = userData.department;
      existing.status = userData.status;
      await existing.save();
      console.log(`UPDATED ${email} as ${userData.role}`);
    } else {
      const created = await UserModel.create({ ...userData, email });
      console.log(`CREATED ${created.email} as ${created.role}`);
    }
  }

  await mongoose.disconnect();
  console.log('Default accounts setup complete.');
})();
