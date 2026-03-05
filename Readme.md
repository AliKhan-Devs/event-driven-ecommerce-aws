# 🏗 Event-Driven E-Commerce Microservices (AWS SNS + SQS)

This project demonstrates a real-world **Event-Driven Microservices Architecture** using:

- AWS SNS (Pub/Sub)
- AWS SQS (Message Queues)
- Node.js (ES Modules)
- MongoDB (Database per service)
- Microservices Pattern

---

## 🚀 Architecture Overview

Client → Order Service → SNS Topic  
                ↓  
               SQS Queues  
               ↓  
      Payment Service  Inventory Service  

---

## 📦 Services

### 1️⃣ Order Service
- Receives order via REST API
- Stores order in MongoDB
- Publishes `OrderCreated` event to SNS

### 2️⃣ Payment Service
- Subscribes to payment SQS queue
- Processes payment asynchronously
- Stores payment record
- Deletes message after success

### 3️⃣ Inventory Service
- Subscribes to inventory SQS queue
- Deducts stock
- Updates inventory database
- Deletes message after success

---

## 🧠 Key Concepts Implemented

- Event-Driven Architecture
- Asynchronous Processing
- Fan-Out Pattern (SNS → Multiple SQS)
- Loose Coupling Between Services
- Independent Databases per Service
- Message Durability
- Horizontal Scalability Ready

---

## 📊 Event Flow

1. Client creates order
2. Order Service publishes event to SNS
3. SNS fans out message to:
   - Payment Queue
   - Inventory Queue
4. Services consume messages independently

---

## 🛠 Tech Stack

- Node.js (ES Modules)
- MongoDB
- AWS SNS
- AWS SQS
- AWS EC2 (for deployment)
- dotenv
- AWS SDK v3

---

## 🧪 Sample Event Payload

```json
{
  "eventType": "OrderCreated",
  "orderId": "order123",
  "productId": "productA",
  "quantity": 2,
  "amount": 500
}