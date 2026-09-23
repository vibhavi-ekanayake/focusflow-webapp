import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import StudySession from '../models/StudySession.js';
import { connectDB, closeDB } from '../config/db.js';

export const seedDemoData = async (shouldClose = false) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    console.log('[Seed] Clearing existing demo data...');
    const existingDemoUser = await User.findOne({ email: 'demo@focusflow.edu' });
    if (existingDemoUser) {
      await StudySession.deleteMany({ userId: existingDemoUser._id });
      await User.deleteOne({ _id: existingDemoUser._id });
    }

    console.log('[Seed] Creating demo user...');
    const demoUser = await User.create({
      name: 'Alex Rivera',
      email: 'demo@focusflow.edu',
      password: 'password123',
      avatar: 'avatar-1',
      dailyGoal: 150, // 2.5 hours
      weeklyGoal: 900, // 15 hours
      settings: {
        theme: 'dark',
        defaultFocusDuration: 25,
        defaultBreakDuration: 5,
        soundEnabled: true,
        autoStartBreaks: false,
        emailNotifications: true
      }
    });

    console.log('[Seed] Demo user created:', demoUser.email);

    const subjects = [
      {
        name: 'Computer Science',
        notes: [
          'Binary search trees and AVL tree balancing',
          'Building fullstack MERN APIs with JWT authentication',
          'Dynamic programming: Knapsack and Longest Common Subsequence',
          'Graph algorithms: Dijkstra and Bellman-Ford'
        ]
      },
      {
        name: 'Mathematics',
        notes: [
          'Multivariable calculus: Gradient vectors and directional derivatives',
          'Linear algebra matrix decomposition: SVD & Eigenvalues',
          'Probability theory: Poisson distributions and Bayes theorem',
          'Differential equations: Second-order homogeneous equations'
        ]
      },
      {
        name: 'Physics',
        notes: [
          'Classical mechanics: Lagrangian formulation and conservation laws',
          'Electromagnetism: Gauss law and Maxwell equations review',
          'Thermodynamics: Carnot cycle and entropy calculations'
        ]
      },
      {
        name: 'Literature',
        notes: [
          'Essay outline on Hamlet and existentialism',
          'Rhetorical analysis and persuasive essay drafting',
          'Critical reading of 19th-century modernist poetry'
        ]
      },
      {
        name: 'Biology',
        notes: [
          'Cellular respiration: Krebs cycle and oxidative phosphorylation',
          'Molecular genetics: Transcription and translation mechanisms'
        ]
      }
    ];

    const durationsInMinutes = [25, 45, 50, 60, 90];
    const sessions = [];

    // Create sessions across the last 14 days to provide a real 7-day streak and rich charts
    for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
      const skipDay = dayOffset > 7 && dayOffset % 3 === 0;
      if (skipDay) continue;

      const sessionsCount = (dayOffset % 2 === 0) ? 2 : (dayOffset % 3 === 0 ? 3 : 1);

      for (let s = 0; s < sessionsCount; s++) {
        const subjObj = subjects[(dayOffset + s) % subjects.length];
        const durationMins = durationsInMinutes[(dayOffset * 2 + s) % durationsInMinutes.length];
        const durationSeconds = durationMins * 60;

        const sessionDate = new Date();
        sessionDate.setDate(sessionDate.getDate() - dayOffset);
        sessionDate.setHours(9 + s * 3, Math.floor(Math.random() * 45), 0, 0);

        const completedAt = new Date(sessionDate.getTime() + durationSeconds * 1000);
        const note = subjObj.notes[s % subjObj.notes.length];

        sessions.push({
          userId: demoUser._id,
          subject: subjObj.name,
          duration: durationSeconds,
          startedAt: sessionDate,
          completedAt,
          notes: note
        });
      }
    }

    await StudySession.insertMany(sessions);
    console.log(`[Seed] Successfully seeded ${sessions.length} study sessions for demo user.`);
    console.log('[Seed] Demo credentials: demo@focusflow.edu / password123');

    if (shouldClose) {
      await closeDB();
      console.log('[Seed] Done!');
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seed Error]:', error);
    if (shouldClose) process.exit(1);
    throw error;
  }
};

// If run directly from CLI
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  seedDemoData(true);
}
