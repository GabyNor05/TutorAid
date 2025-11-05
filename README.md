![banner](./frontend/src/pages/reusableAssets/logo.png)

- - - -

# Tutor Aid

Tutor Aid is a platform designed to connect **students** with **reliable and relatable tutors** who understand their learning journey. The platform focuses on simplicity, trust, and efficiency — allowing students to easily find support, book sessions, and grow academically.

As a tutor myself, I saw how difficult it can be to manage timetables, communicate with students, and present yourself professionally online. Tutor Aid is built to make that entire process smoother, supportive, and human.

The goal is to empower tutors to **share knowledge confidently**, while helping students receive ** consistent, meaningful academic support **.

---

## How to run Tutor Aid

#### Step 1: Clone the repo
```
https://github.com/andrevanheerden/Yggdrasil.git
```
#### Step 2:

Open tutoraid frontend file in terminal:

```
cd frontend
```

#### Step 3:

Install dependencies using the terminal:

```
npm install
```

#### Step 4:

Now open a new terminal and open backend files:

```
cd backend
```

#### Step 5:

start the backend: 

```
npm start
```

#### Step 6:

Go to the frontend terminal and start the frontend: 

```
npm start
```


Your application should now automatically open in your browser.

---

## Tutor Aid is built with

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00648B?style=for-the-badge&logo=mysql&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)

---

## Data Structure Overview

(Describe your database tables & how they relate — fill in when ready)

Example:

| Table        | Description | Key Fields |
|-------------|-------------|------------|
| users       | Stores student & tutor accounts | user_id, name, email, role |
| tutors      | Stores tutor profile details | tutor_id, subjects, bio, fee_per_hour |
| bookings    | Stores tutoring session bookings | booking_id, student_id, tutor_id, date, status |
| reviews     | Stores feedback from students | review_id, rating, comment, tutor_id |

---

## Deployment Process

#### Frontend (React):
Deployed on **Vercel**.  
Environment variables are used to securely reference the backend API.

#### Backend (Node + Express):
Deployed on **Render**.  
Responsible for handling data requests, authentication, and database communication.

#### Database (MySQL):
Hosted on **AlwaysData**, allowing remote access through phpMyAdmin.  
Credentials are stored as environment variables.

---

## Demo Video

(Insert link here once recorded)


---

## Reflection

### ⭐ Proud Moments
- (Example) Built a full stack application independently.
- Successfully integrated database + backend + frontend deployments.
- Created a platform that reflects real tutor needs.

### ⚡ Challenges & Solutions
| Challenge | Solution |
|----------|----------|
| Deployment complexity between services | Learned to use environment variables & hosting platforms. |
| Managing database hosting | Moved from local MySQL to AlwaysData for remote access. |
| Designing a clean user booking flow | Tested mock UI flows and simplified navigation. |

---

## Mockups / Screenshots (optional)

(Add Figma mockups or UI screenshots if you want)

---

## Conclusion

Tutor Aid is more than a web application — it’s a tool built from real experience in tutoring. By bridging student needs with empathetic, prepared tutors, the platform helps create supportive learning environments that go beyond one session at a time.

Thank you to everyone who supported the process — from research, to testing, to reviewing.
