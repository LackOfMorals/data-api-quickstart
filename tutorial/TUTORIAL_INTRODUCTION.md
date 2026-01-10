# Build a Movie Web Application with Neo4j and GraphQL

This tutorial guides you through building a complete web application using Neo4j's DataAPI GraphQL service. You'll learn how to read, create, update, and delete data in a graph database while building a real-world movie management application.

## What You'll Build

By the end of this tutorial, you'll have a fully functional web application that:
- Displays movies from the Neo4j Movie graph database
- Allows you to create new movies and people
- Enables editing existing movies
- Supports searching across movies, actors, and directors
- Manages relationships between movies and people
- Uses GraphQL for efficient data fetching

## What You'll Learn

- How to connect a web application to Neo4j using GraphQL
- Reading data from a graph database with GraphQL queries
- Creating and modifying data with GraphQL mutations
- Managing relationships in a graph database
- Implementing search functionality across connected data
- Building a responsive React application with TypeScript

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18 or later** installed on your computer
- **A Neo4j Aura account** with a free database instance
- **Basic knowledge** of JavaScript/TypeScript and React
- **A code editor** like VS Code

If you don't have a Neo4j Aura account, you can [sign up for free](https://neo4j.com/cloud/aura-free/).

## Tutorial Overview

This tutorial is divided into the following chapters:

1. **[Set Up Your Environment](#chapter-1-set-up-your-environment)** - Create your project and configure Neo4j
2. **[Read Data from Neo4j](#chapter-2-read-data-from-neo4j)** - Display movies from your database
3. **[Create New Data](#chapter-3-create-new-data)** - Add new movies to your database
4. **[Update Existing Data](#chapter-4-update-existing-data)** - Edit movie information
5. **[Delete Data](#chapter-5-delete-data)** - Remove movies from your database
6. **[Manage Relationships](#chapter-6-manage-relationships)** - Connect actors and directors to movies
7. **[Search and Filter](#chapter-7-search-and-filter)** - Implement search functionality
8. **[Deploy Your Application](#chapter-8-deploy-your-application)** - Make your app available online

Let's get started!

---
