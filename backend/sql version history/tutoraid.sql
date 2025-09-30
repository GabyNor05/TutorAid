-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 30, 2025 at 10:12 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tutoraid`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `adminID` int(11) NOT NULL,
  `userID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`adminID`, `userID`) VALUES
(5, 65);

-- --------------------------------------------------------

--
-- Table structure for table `lessonreports`
--

CREATE TABLE `lessonreports` (
  `lessonReportID` int(11) NOT NULL,
  `studentID` int(11) NOT NULL,
  `subject` varchar(50) NOT NULL,
  `reportDate` date NOT NULL,
  `comments` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lessonreports`
--

INSERT INTO `lessonreports` (`lessonReportID`, `studentID`, `subject`, `reportDate`, `comments`) VALUES
(1, 36, 'Math', '2025-09-29', 'He used inappropriate language and was very disrespectful.');

-- --------------------------------------------------------

--
-- Table structure for table `lessons`
--

CREATE TABLE `lessons` (
  `lessonID` int(11) NOT NULL,
  `tutorID` int(11) NOT NULL,
  `studentID` int(11) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `startTime` time NOT NULL,
  `duration` int(11) NOT NULL,
  `endTime` time GENERATED ALWAYS AS (addtime(`startTime`,sec_to_time(`duration` * 60))) STORED,
  `status` enum('pending','accepted','declined') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lessons`
--

INSERT INTO `lessons` (`lessonID`, `tutorID`, `studentID`, `subject`, `date`, `startTime`, `duration`, `status`) VALUES
(3, 40, 60, 'IT', '2025-09-28', '14:00:00', 60, 'declined'),
(5, 40, 40, 'Math', '2025-10-01', '16:00:00', 180, 'accepted'),
(6, 40, 40, 'IT', '2025-11-01', '16:00:00', 90, 'accepted'),
(7, 40, 40, 'Afrikaans', '2025-11-07', '16:00:00', 60, 'declined');

-- --------------------------------------------------------

--
-- Table structure for table `progressnotes`
--

CREATE TABLE `progressnotes` (
  `noteID` int(11) NOT NULL,
  `studentID` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `file_size` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `progressnotes`
--

INSERT INTO `progressnotes` (`noteID`, `studentID`, `file_path`, `file_name`, `mime_type`, `uploaded_at`, `file_size`) VALUES
(1, 40, 'uploads\\progressnotes\\1759179251376-lesson-feedback(1).pdf', 'lesson-feedback(1).pdf', 'application/pdf', '2025-09-29 20:54:11', 122),
(8, 40, 'https://res.cloudinary.com/dvkt6agj3/raw/upload/v1759188029/pdgi5yyknvvsdidszhyw.pdf', '1759179251376-lesson-feedback(1)(8).pdf', 'application/pdf', '2025-09-29 23:20:29', 3992);

-- --------------------------------------------------------

--
-- Table structure for table `studentrequests`
--

CREATE TABLE `studentrequests` (
  `studentRequestID` int(11) NOT NULL,
  `studentID` int(11) NOT NULL,
  `requestType` varchar(50) NOT NULL,
  `lessonDate` date DEFAULT NULL,
  `subjectID` int(11) DEFAULT NULL,
  `newSubjectName` varchar(50) DEFAULT NULL,
  `newSubjectDescription` text DEFAULT NULL,
  `query` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `studentrequests`
--

INSERT INTO `studentrequests` (`studentRequestID`, `studentID`, `requestType`, `lessonDate`, `subjectID`, `newSubjectName`, `newSubjectDescription`, `query`, `createdAt`) VALUES
(6, 41, 'add_subject', NULL, NULL, 'isiNdebele', 'Very important for students whose mother tongue is isiNdebele, as they mostly take it as a First Additional Language at school. It is taught differently from isiNdebele Home Language, which can be hard for students.', NULL, '2025-09-30 01:42:36');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `studentID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `grade` varchar(50) DEFAULT NULL,
  `school` varchar(150) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive','Blocked') NOT NULL DEFAULT 'Active',
  `city` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`studentID`, `userID`, `grade`, `school`, `address`, `status`, `city`, `province`) VALUES
(36, 35, '12', 'Abbots College', 'The Moon', 'Inactive', 'Pretoria', 'Gauteng'),
(37, 36, '12', 'Affies', 'Fairway', 'Inactive', 'Johannesburg', 'Gauteng'),
(40, 60, '2', 'Glenstansia', 'Corner of Chopin and Duvenoux Str', 'Inactive', NULL, NULL),
(41, 61, '12', 'Woodhill College', '123 Mac Bananas Str', 'Blocked', 'Pretoria', 'Gauteng'),
(42, 66, 'ndaiudh', 'djiqjdoq', 'jdujd', 'Active', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `subjectID` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`subjectID`, `name`, `description`) VALUES
(1, 'Math', 'Personalised support in algebra, geometry, and problem-solving to build strong numerical skills.'),
(2, 'Afrikaans', 'Tutoring in reading, writing, and speaking Afrikaans for schoolwork or exams.'),
(3, 'Physics', 'Help with concepts, experiments, and calculations to master physical science topics.'),
(4, 'Biology', 'Guidance through life-science theory, lab work, and exam preparation.'),
(5, 'English', 'Coaching in grammar, comprehension, and essay writing for confident communication.'),
(6, 'Zulu', 'Focused lessons to improve isiZulu vocabulary, grammar, and conversation for schoolwork or exams.'),
(7, 'Sepedi', 'Step-by-step language tutoring to strengthen Sepedi speaking and writing.'),
(8, 'Math Literacy', 'Practical maths tutoring for everyday applications and assessments.'),
(9, 'AP Math', 'Advanced mathematics support for higher-level or university-prep learners.'),
(10, 'AP English', 'Intensive reading and writing practice for advanced English courses.'),
(11, 'AP Biology', 'Deep-dive tutoring in advanced biology topics and lab skills.'),
(12, 'IT', 'One-on-one help with coding, networks, and digital technology projects.'),
(13, 'CAT', 'Tutoring in office software, presentations, and computer skills for school success.'),
(14, 'History', 'Guidance in analysing sources and writing strong history essays.'),
(15, 'Geography', 'Help understanding maps, earth systems, and environmental studies.'),
(16, 'EMS', 'Tutoring in basic economics, business concepts, and financial literacy.'),
(17, 'Business Studies', 'Support in management principles, entrepreneurship, and exam prep.'),
(18, 'Accounting', 'Step-by-step help with financial statements and journals skills for exams.'),
(19, 'Homework', 'General homework assistance across subjects to reinforce daily learning.');

-- --------------------------------------------------------

--
-- Table structure for table `tutoravailability`
--

CREATE TABLE `tutoravailability` (
  `id` int(11) NOT NULL,
  `tutorID` int(11) NOT NULL,
  `day_group` enum('Mon-Fri','Sat-Sun') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tutors`
--

CREATE TABLE `tutors` (
  `tutorID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `bio` text DEFAULT NULL,
  `subjects` varchar(255) DEFAULT NULL,
  `qualifications` varchar(255) DEFAULT NULL,
  `availability` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tutors`
--

INSERT INTO `tutors` (`tutorID`, `userID`, `bio`, `subjects`, `qualifications`, `availability`) VALUES
(6, 40, 'I love helping students gain more confidence in their learning ability, whether it is having patience to figure out an equation or practising until they get the pronunciation in languages. I aim to guide children to reach their full potential.', 'Math, Afrikaans, IT', 'Matric IEB', 'Mon-Fri: 16:00-19:00; Sat-Sun: 14:00-18:00');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userID` int(11) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Admin','Tutor','Student') NOT NULL,
  `lastLogin` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `image`, `name`, `email`, `password`, `role`, `lastLogin`) VALUES
(35, NULL, 'Darian Martin', '241355@virtualwindow.co.za', '$2b$10$1F2QBVFfN5MY9NnbqfXM2u5qiKyBKIg4ZT8ngdNXBAi.VdGASvta2', 'Student', '2025-09-24 10:00:16'),
(36, NULL, 'Andre van Heerden2', '241155@virtualwindow.co.za', '$2b$10$E5051LjwjLVXfg7sG7npHuA7l40RNkKdRthg4Xt6JBQ5GcL.QFWMK', 'Student', '2025-09-24 10:00:16'),
(40, 'https://res.cloudinary.com/dvkt6agj3/image/upload/v1758746693/uploads/saiid1yv7osyuugtvueb.png', 'Megan-Lilly Smith', 'meganlillySmith895@gmail.com', '$2b$10$66sPU8Y2E0AlDHsjxrQjn./wbS2W7Fyf/zDBVR5CH3eSXThy.Tvw6', 'Tutor', '2025-09-30 10:07:07'),
(60, 'https://res.cloudinary.com/dvkt6agj3/image/upload/v1759006221/uploads/g0jv5xa1eggrusrmpoud.png', 'Mpho Norris', 'gmmnorris@gmail.com', '$2b$10$VRimRNUamIAHxEBgKI3ipeuTWJnjoprCsZTmQKAgVRPMit2pl/1iW', 'Student', NULL),
(61, NULL, 'Gabrielle Norris', 'gabriellenor05@gmail.com', '$2b$10$Ok0NZjIGSwhLOVUBCKgeAO2b7D76Or59agoGGOA3xo9ixUIDRrd.i', 'Student', '2025-09-30 01:54:28'),
(65, 'https://res.cloudinary.com/dvkt6agj3/image/upload/v1759214391/users/bph0frnlfpqlpfviekzz.jpg', 'Admin', 'tutoraid.dv200@gmail.com', '$2b$10$UeOL0CxG5N1JPVv73IWh4OpXvbHFcDFHPAvo1OjFEHu83nsJ51liG', 'Admin', NULL),
(66, NULL, 'Gaby Norris', '241143@virtualwindow.co.za', '$2b$10$uMgtJJuCGOoO.8D1S83RFOlfJRxSIYfztHhIc4gojVWFSNMq53cb.', 'Student', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`adminID`),
  ADD KEY `fk_admin_user` (`userID`);

--
-- Indexes for table `lessonreports`
--
ALTER TABLE `lessonreports`
  ADD PRIMARY KEY (`lessonReportID`),
  ADD KEY `fk_student` (`studentID`);

--
-- Indexes for table `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`lessonID`),
  ADD KEY `tutorID` (`tutorID`),
  ADD KEY `studentID` (`studentID`);

--
-- Indexes for table `progressnotes`
--
ALTER TABLE `progressnotes`
  ADD PRIMARY KEY (`noteID`),
  ADD KEY `fk_progress_student` (`studentID`);

--
-- Indexes for table `studentrequests`
--
ALTER TABLE `studentrequests`
  ADD PRIMARY KEY (`studentRequestID`),
  ADD KEY `studentID` (`studentID`),
  ADD KEY `subjectID` (`subjectID`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`studentID`),
  ADD UNIQUE KEY `userID` (`userID`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`subjectID`);

--
-- Indexes for table `tutoravailability`
--
ALTER TABLE `tutoravailability`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tutorID` (`tutorID`);

--
-- Indexes for table `tutors`
--
ALTER TABLE `tutors`
  ADD PRIMARY KEY (`tutorID`),
  ADD KEY `fk_tutor_user` (`userID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userID`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `adminID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `lessonreports`
--
ALTER TABLE `lessonreports`
  MODIFY `lessonReportID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `lessons`
--
ALTER TABLE `lessons`
  MODIFY `lessonID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `progressnotes`
--
ALTER TABLE `progressnotes`
  MODIFY `noteID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `studentrequests`
--
ALTER TABLE `studentrequests`
  MODIFY `studentRequestID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `studentID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `subjectID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `tutoravailability`
--
ALTER TABLE `tutoravailability`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tutors`
--
ALTER TABLE `tutors`
  MODIFY `tutorID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admins`
--
ALTER TABLE `admins`
  ADD CONSTRAINT `fk_admin_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

--
-- Constraints for table `lessonreports`
--
ALTER TABLE `lessonreports`
  ADD CONSTRAINT `fk_student` FOREIGN KEY (`studentID`) REFERENCES `students` (`studentID`),
  ADD CONSTRAINT `lessonreports_ibfk_1` FOREIGN KEY (`studentID`) REFERENCES `students` (`studentID`);

--
-- Constraints for table `lessons`
--
ALTER TABLE `lessons`
  ADD CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`tutorID`) REFERENCES `tutors` (`userID`),
  ADD CONSTRAINT `lessons_ibfk_2` FOREIGN KEY (`studentID`) REFERENCES `users` (`userID`);

--
-- Constraints for table `progressnotes`
--
ALTER TABLE `progressnotes`
  ADD CONSTRAINT `fk_progress_student` FOREIGN KEY (`studentID`) REFERENCES `students` (`studentID`) ON DELETE CASCADE;

--
-- Constraints for table `studentrequests`
--
ALTER TABLE `studentrequests`
  ADD CONSTRAINT `studentrequests_ibfk_1` FOREIGN KEY (`studentID`) REFERENCES `students` (`studentID`),
  ADD CONSTRAINT `studentrequests_ibfk_2` FOREIGN KEY (`subjectID`) REFERENCES `subjects` (`subjectID`);

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `fk_student_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

--
-- Constraints for table `tutoravailability`
--
ALTER TABLE `tutoravailability`
  ADD CONSTRAINT `tutoravailability_ibfk_1` FOREIGN KEY (`tutorID`) REFERENCES `tutors` (`tutorID`) ON DELETE CASCADE;

--
-- Constraints for table `tutors`
--
ALTER TABLE `tutors`
  ADD CONSTRAINT `fk_tutor_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
