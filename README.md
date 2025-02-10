# Backend Developer Technical Challenge

This repository contains my solution for a coding challenge given during the interview process for a backend developer position. The project involves creating a Node.js application with two main endpoints.

## Task Description

The goal is to implement a small project with two main features. 

### Technical Requirements

- **Stack**: 
  - Strict TypeScript
  - Framework options: Hono/Elysia/Fastify/Express
- Documentation and tests are not required
- Input validation is optional but will be considered a plus

### Feature Requirements

#### Endpoint 1: Item Prices
Create an endpoint that displays an array of objects containing the two lowest prices for each item (one tradable and one non-tradable).
- Data should be fetched from the Skinport API: https://docs.skinport.com/items
- Use default values for app_id and currency parameters
- Implement Redis caching for the items data

#### Endpoint 2: Product Purchase
Implement a purchase system for fictional products with the following requirements:
- Create and populate a products table (multiple items with decimal prices)
- Implement user balance system
- Return updated user balance after purchase

### Database Schema

The database should contain three tables:
- users
- products
- purchases

The database schema should be included in the repository.

## Getting Started

[Instructions for setting up and running the project should be added here]

## Database Schema

[Database schema details should be added here]

## API Documentation

[Basic API endpoint documentation should be added here]
