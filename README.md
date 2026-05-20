# YIC Events

YIC Events is a PHP, MySQL, HTML, CSS, and JavaScript web application for managing student event registration. The project lets students create accounts, log in, browse available events, register for events, view their dashboard, and open event details from an event calendar. It also includes an admin area for adding events, adding users, viewing system data, and deleting events.

## Features

- Student registration and login using Student ID and password
- Session-based authentication with PHP
- Event browsing with search and filters
- Event details modal with date, location, category, and description
- Event registration saved in the database
- Student dashboard for registration information
- Calendar page for viewing events by month
- Admin login gate and admin panel
- Admin tools for adding events, uploading event images, adding users, and deleting events
- MySQL database schema for users, events, and registrations

## Technologies Used

- HTML5
- CSS3
- JavaScript
- PHP
- MySQL
- PDO for database access

## Project Structure

```text
.
+-- Pages/
|   +-- home.html
|   +-- login.html
|   +-- register.html
|   +-- events.html
|   +-- dashboard.html
|   +-- calendar.html
|   +-- admin.html
+-- php/
|   +-- login_process.php
|   +-- register_process.php
|   +-- register_event.php
|   +-- get_events.php
|   +-- get_users.php
|   +-- get_registrations.php
|   +-- add_event.php
|   +-- add_user.php
|   +-- delete_event.php
|   +-- logout.php
+-- config/
|   +-- db.php
+-- database/
|   +-- yic_events.sql
+-- css/
|   +-- style.css
+-- js/
|   +-- script.js
+-- images/
```

## Database

The database file is located at:

```text
database/yic_events.sql
```

It creates a database named `yic_events` with these main tables:

- `users`: stores student and admin/user account data
- `events`: stores event title, date, location, category, description, and image name
- `registrations`: connects students to the events they registered for

## Setup Instructions

1. Place the project folder inside your local web server directory, such as Laragon `www` or XAMPP `htdocs`.
2. Start Apache and MySQL.
3. Import `database/yic_events.sql` into MySQL using phpMyAdmin or another database tool.
4. Check the database connection settings in `config/db.php`.

Default connection settings:

```php
$host = "localhost";
$dbname = "yic_events";
$username = "root";
$password = "";
```

5. Open the project in your browser:

```text
http://localhost/CS381_Project_441500071_441500004-main/Pages/home.html
```

## Admin Access

The admin login is handled in `php/admin_login.php`.

Default admin credentials:

```text
Employee ID: EMP001
Password: admin123
```

After logging in, the admin can manage events and users through `Pages/admin.html`.

## Main Pages

- `home.html`: landing page for entering the event system
- `register.html`: student account registration page
- `login.html`: student login page
- `events.html`: event listing, filtering, details, and registration page
- `dashboard.html`: student dashboard for viewing registrations
- `calendar.html`: monthly event calendar
- `admin.html`: admin login and management panel

## Authors

- Layan 441500004
- Nada 441500071
