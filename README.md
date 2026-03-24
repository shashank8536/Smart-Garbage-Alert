# 🍃 Smart Garbage Alert System

A comprehensive, full-stack (MERN) civic-tech platform designed to modernize municipal waste management operations and empower citizens to help build cleaner communities.

## 🚀 Features

### 👤 For Citizens
* **Easy Reporting:** Snap a picture and report open dumping, overflowing bins, or missed garbage pickups.
* **Location Tracking:** Interactive map integration (powered by Leaflet) to pinpoint the exact location of the issue.
* **Real-time Status:** Track your complaint from "Pending" to "In Progress" and finally to "Resolved".
* **Automated Alerts:** Receive push-like notifications about upcoming garbage truck arrival times in your specific ward.

### 🏛️ For Municipal Officers
* **Analytics Dashboard:** Get a bird's-eye view of your ward with live statistics on pending, escalated, and resolved issues.
* **Interactive Complaint Map:** Visually track where the most severe waste issues are clustered to better allocate cleaning resources.
* **Case Management:** Update the status of active complaints with a single click, instantly notifying the reporting citizen.
* **Smart Insights (GenAI integration):** Automatically generates daily performance reports and sentiment analysis based on recent citizen feedback.

## 🛠️ Tech Stack

* **Frontend:** React.js, Vite, Tailwind CSS, Lucide Icons, React-Leaflet
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose) + Cloudinary (for image storage)
* **Authentication:** JWT (JSON Web Tokens) & bcrypt for secure passwords
* **Optional AI Engine:** Anthropic Claude API for smart alerts and automated citizen feedback synthesis.

## 💻 Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shashank8536/Smart-Garbage-Alert.git
   cd Smart-Garbage-Alert
   ```

2. **Install dependencies:**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables:**
   * Create a `.env` file in the `/server` directory using the provided `.env.example` as a template.
   * Add your `MONGO_URI`, `JWT_SECRET`, and `CLOUDINARY` credentials.

4. **Run the development servers:**
   ```bash
   # Terminal 1: Start Backend
   cd server
   npm run dev

   # Terminal 2: Start Frontend
   cd client
   npm run dev
   ```

## 🤝 Contributing
Contributions are always welcome! This project was built to solve real-world municipal tracking issues, but there's always room for improvement in efficiency and user experience.
