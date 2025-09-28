-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 25, 2025 at 06:23 PM
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
(1, 38);

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
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `status` varchar(50) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`studentID`, `userID`, `grade`, `school`, `address`, `status`, `city`, `province`) VALUES
(1, 1, '10', 'Test High School', '123 Test St', 'Active', NULL, NULL),
(35, 34, 'Further Studies', 'Tuks', 'Brooklyn', 'Active', 'Pretoria', 'Gauteng'),
(36, 35, '12', 'Abbots College', 'The Moon', 'Active', 'Pretoria', 'Gauteng'),
(37, 36, '12', 'Affies', 'Fairway', 'Active', 'Johannesburg', 'Gauteng'),
(39, 42, '7', 'Woodhill Collage', 'Martha Smit str, Garsfontein', 'Active', NULL, NULL);

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
(1, 3, 'Very enthusiastic tutor with a passion for teaching.', 'Mathematics, Physics', 'M.Sc. in Physics', 'Weekdays 10 AM - 2 PM'),
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
  `role` enum('Admin','Tutor','Student') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `image`, `name`, `email`, `password`, `role`) VALUES
(1, 'https://via.placeholder.com/150', 'Test User', 'testuser1758701590180@example.com', '$2b$10$gSOGYEzDwIyZzEUiFcETkeBl5VJCbhKf9TgHRX7UcBhQ4wblIr.fG', 'Student'),
(2, 'https://picsum.photos/200/300', 'Jennifer Bezuidenhout', 'jenibez08@gmail.com', 'H!1@mJ3n!102924925', 'Tutor'),
(3, 'https://picsum.photos/id/28/200/300', 'Sophie Leighton', 'sophleighton1758703652019@example.com', '$2b$10$Yo6PLA/uHYaP1bIjYGRdd.QOIFbtlpbwAQNzW.Qm7.wWC22gJOYa.', 'Tutor'),
(34, NULL, 'Jenna vdl', 'jenvdl03@gmail.com', '$2b$10$9EH/c1T6OVODn47Y32Rlg.KZCMosDHD91kX/8zCWYn6vX3I0gV/iG', 'Student'),
(35, NULL, 'Darian Martin', '241355@virtualwindow.co.za', '$2b$10$1F2QBVFfN5MY9NnbqfXM2u5qiKyBKIg4ZT8ngdNXBAi.VdGASvta2', 'Student'),
(36, NULL, 'Andre van Heerden2', '241155@virtualwindow.co.za', '$2b$10$E5051LjwjLVXfg7sG7npHuA7l40RNkKdRthg4Xt6JBQ5GcL.QFWMK', 'Student'),
(38, 'https://res.cloudinary.com/dvkt6agj3/image/upload/v1758741538/users/dk9rn51yxxbhrfzylier.jpg', 'Gaby Norris', '241143@virtualwindow.co.za', '$2b$10$XbzhqmrBvURz3Z1PF7XxU.3qAvAkZExnEwDlbCTnOrky.bDnCapka', 'Admin'),
(40, 'https://res.cloudinary.com/dvkt6agj3/image/upload/v1758746693/uploads/saiid1yv7osyuugtvueb.png', 'Megan-Lilly Smith', 'meganlillySmith895@gmail.com', '$2b$10$66sPU8Y2E0AlDHsjxrQjn./wbS2W7Fyf/zDBVR5CH3eSXThy.Tvw6', 'Tutor'),
(42, NULL, 'Megan Norris', 'gmmnorris@gmail.com', '$2b$10$CLg87OkGWJQ4viuVGAb.oOzO1XUUotwK2RR8GjXl6XkHUXiUPj/je', 'Student');

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
-- Indexes for table `progressnotes`
--
ALTER TABLE `progressnotes`
  ADD PRIMARY KEY (`noteID`),
  ADD KEY `fk_progress_student` (`studentID`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`studentID`),
  ADD UNIQUE KEY `userID` (`userID`);

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
  MODIFY `adminID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `progressnotes`
--
ALTER TABLE `progressnotes`
  MODIFY `noteID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `studentID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

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
  MODIFY `userID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admins`
--
ALTER TABLE `admins`
  ADD CONSTRAINT `fk_admin_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

--
-- Constraints for table `progressnotes`
--
ALTER TABLE `progressnotes`
  ADD CONSTRAINT `fk_progress_student` FOREIGN KEY (`studentID`) REFERENCES `students` (`studentID`) ON DELETE CASCADE;

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
