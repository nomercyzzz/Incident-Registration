-- Создать базу данных (если еще не создана)
CREATE DATABASE IF NOT EXISTS incident_db;
USE incident_db;

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- Таблица инцидентов
CREATE TABLE IF NOT EXISTS incidents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INT,
    type VARCHAR(255),
    location VARCHAR(255),
    regNumber VARCHAR(50) UNIQUE,
    date VARCHAR(50),
    involvedPersons JSON,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Таблица форм (примерная структура, уточните при необходимости)
CREATE TABLE IF NOT EXISTS forms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    fields JSON
);
