CREATE DATABASE IF NOT EXISTS yic_events;
USE yic_events;



CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    major VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    role VARCHAR(20) DEFAULT 'user'
);


CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(100),
    category VARCHAR(50),
    description TEXT,
    image VARCHAR(255)
);

INSERT INTO events 
(title, date, location, category, description, image)
VALUES

(
'University Sports Day',
'2026-06-18',
'University Gym',
'Sports',
'An exciting fitness event designed to encourage students to stay active and healthy through sports competitions, gym activities, and teamwork challenges in a fun and energetic environment.',
'1778623246_University Sports Day.jpg'
),

(
'Academic Success Seminar',
'2026-06-25',
'Building A Room 112',
'Academic',
'This academic seminar focuses on improving study skills, time management, and career preparation for university students through interactive sessions and practical advice.',
'1778623514_AcademicSuccessSeminar.jpg'
),

(
'Student Social Activity',
'2026-07-05',
'Outdoor Campus Area',
'Social',
'Student Social Activity allows students to meet new friends, participate in entertainment activities, and enjoy a positive and engaging social atmosphere on campus.',
'1778623992_OutdoorCampusArea.jpg'
),

(
'Cultural Heritage Festival',
'2026-07-15',
'Campus Theater',
'Cultural',
'The Cultural Heritage Festival celebrates traditions, music, food, and cultural diversity through performances, exhibitions, and creative student activities.',
'1778624237_CulturalHeritageFestival.jpg'
),

(
'Outdoor Movie',
'2026-08-10',
'Campus Garden',
'Social',
'Students are invited to enjoy an outdoor movie experience with relaxing activities, snacks, and entertainment in a comfortable university environment.',
'1778624600_OutdoorMovie.jpg'
),

(
'Art & Culture Exhibition',
'2026-08-18',
'Exhibition Hall',
'Cultural',
'This cultural exhibition highlights student creativity through paintings, photography, artistic projects, and creative performances that encourage cultural appreciation.',
'1778624818_Art & Culture Exhibition.jpg'
),

(
'Career Development Workshop',
'2026-08-25',
'Conference Hall',
'Academic',
'The Career Development Workshop helps students improve communication, interview preparation, CV writing, and professional skills for future careers.',
'1778625100_CareerDevelopmentWorkshop.jpg'
),

(
'Fun & Games Event',
'2026-08-20',
'Building C',
'Social',
'Fun & Games Event is designed to create an enjoyable and interactive experience for students through games, competitions, and social entertainment activities.',
'1778625456_Fun&GamesEvent.jpg'
),

(
'Photography Workshop',
'2026-06-30',
'Theater',
'Cultural',
'The Photography Workshop introduces students to photography basics, camera settings, lighting techniques, and creative photo composition through practical activities.',
'1778625640_PhotographyWorkshop.jpg'
),

(
'Book Reading Event',
'2026-06-23',
'Library',
'Academic',
'The Book Reading Event encourages students to improve reading habits, exchange ideas, and participate in discussions that support learning and creativity.',
'1778625823_BookReadingEvent.jpg'
),

(
'Coding Challenge',
'2026-05-26',
'Computer Lab 032',
'Academic',
'The Coding Challenge event allows students to solve programming problems, improve coding skills, and practice logical thinking in a competitive environment.',
'1778632060_CodingChallenge.jpeg'
),

(
'Table Tennis Tournament',
'2026-06-01',
'University Gym',
'Sports',
'The Table Tennis Tournament brings students together for exciting matches that encourage teamwork, concentration, and physical activity in a fun atmosphere.',
'1778632233_TableTennisTournament.jpg'
),

(
'Public Speaking Workshop',
'2026-06-25',
'Conference Hall',
'Academic',
'The Public Speaking Workshop helps students improve presentation techniques, communication skills, and confidence while speaking in front of an audience.',
'1778632363_PublicSpeakingWorkshop.jpg'
);


CREATE TABLE registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20),
    event_id INT,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'registered',

    FOREIGN KEY (student_id) REFERENCES users(student_id)
    ON DELETE CASCADE,

    FOREIGN KEY (event_id) REFERENCES events(id)
    ON DELETE CASCADE
);

