# Event-Driven E-Commerce Microservices with AWS SNS and SQS

A hands-on project to practice building distributed systems using microservices architecture. This repository demonstrates asynchronous communication between services through AWS Simple Notification Service (SNS) and Simple Queue Service (SQS), implementing an event-driven e-commerce system.

## 🏗️ Architecture Overview

This project implements a **fan-out pattern** where:
- **Order Service** receives orders via REST API and publishes events to SNS
- **Payment Service** and **Inventory Service** subscribe to SQS queues to process events asynchronously

```
Client Request
     ↓
Order Service (REST API)
     ↓ (Publishes to SNS)
SNS Topic
     ↓ (Fan-out to SQS Queues)
Payment SQS ← Payment Service
Inventory SQS ← Inventory Service
```

### Key Concepts Demonstrated
- **Event-Driven Architecture**: Loose coupling through events
- **Asynchronous Processing**: Non-blocking message handling
- **Microservices Communication**: Via message queues
- **Database per Service**: Independent MongoDB instances
- **Fault Tolerance**: Message retry and dead-letter queues (configurable)

## 📦 Services

### 1. Order Service
- **Port**: 4000
- **Responsibilities**:
  - Exposes REST API for order creation
  - Persists orders in MongoDB
  - Publishes `ORDER_CREATED` events to SNS
- **Technologies**: Node.js, Express, MongoDB, AWS SNS SDK

### 2. Payment Service
- **Port**: 5000
- **Responsibilities**:
  - Consumes messages from Payment SQS queue
  - Processes payments asynchronously
  - Stores payment records
  - Acknowledges message processing
- **Technologies**: Node.js, MongoDB, AWS SQS SDK

### 3. Inventory Service
- **Port**: 6000
- **Responsibilities**:
  - Consumes messages from Inventory SQS queue
  - Updates inventory stock levels
  - Handles stock deduction logic
  - Acknowledges message processing
- **Technologies**: Node.js, MongoDB, AWS SQS SDK

## 🛠️ Technologies Used

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js (Order Service)
- **Database**: MongoDB (per service)
- **AWS Services**: SNS (Pub/Sub), SQS (Queues)
- **SDK**: AWS SDK v3 for JavaScript
- **Development**: Nodemon for hot reloading

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- AWS Account with SNS and SQS access
- AWS CLI configured (optional, for local testing)

## 🚀 Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Install Dependencies
Each service has its own dependencies. Install them separately:

```bash
# Order Service
cd order-service
npm install

# Payment Service
cd ../payment-service
npm install

# Inventory Service
cd ../inventory-service
npm install
```

### 3. AWS Configuration

#### Create SNS Topic
1. Go to AWS SNS Console
2. Create a new Standard Topic (e.g., `ecommerce-orders`)
3. Note the Topic ARN

#### Create SQS Queues
1. Go to AWS SQS Console
2. Create two Standard Queues:
   - `payment-queue`
   - `inventory-queue`
3. Subscribe each queue to the SNS topic
4. Note the Queue URLs

### 4. Environment Variables

Create `.env` files in each service directory:

#### Order Service (.env)
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/orderdb
AWS_REGION=us-east-1
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:ecommerce-orders
```

#### Payment Service (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/paymentdb
AWS_REGION=us-east-1
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789012/payment-queue
```

#### Inventory Service (.env)
```env
PORT=6000
MONGO_URI=mongodb://localhost:27017/inventorydb
AWS_REGION=us-east-1
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789012/inventory-queue
```

### 5. Start MongoDB
Ensure MongoDB is running locally or update connection strings for Atlas.

### 6. Run the Services

Start each service in separate terminals:

```bash
# Terminal 1: Order Service
cd order-service
npm run dev

# Terminal 2: Payment Service
cd payment-service
npm run dev

# Terminal 3: Inventory Service
cd inventory-service
npm run dev
```

## 🧪 Testing the System

### Create an Order
```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 99.99,
    "items": [
      {"productId": "prod-123", "quantity": 2}
    ]
  }'
```

### Expected Flow
1. Order is created and stored in Order DB
2. Event is published to SNS
3. SNS fans out to both SQS queues
4. Payment Service processes payment
5. Inventory Service updates stock
6. Messages are deleted from queues

Check service logs to see message processing.

## 📸 Screenshots

### AWS Console Dashboards
- **SNS Topic**: [pictures/sns.png](pictures/sns.png) - Shows topic configuration and subscriptions
- **SQS Queues**: [pictures/sqs.png](pictures/sqs.png) - Displays queue metrics and messages

### Service Consoles
- **Order Service**: [pictures/order-service.png](pictures/order-service.png) - API request handling
- **Payment Service**: [pictures/payment_service.png](pictures/payment_service.png) - Queue message processing
- **Inventory Service**: [pictures/inventory_service.png](pictures/inventory_service.png) - Stock updates

## 🔧 Development Notes

- Each service runs independently with its own database
- Services communicate only through events (no direct API calls)
- Message processing is idempotent (safe to retry)
- Use environment variables for configuration
- Monitor AWS CloudWatch for queue metrics

## 📚 Learning Outcomes

This project helps understand:
- Designing event-driven microservices
- Implementing pub/sub patterns with SNS/SQS
- Handling asynchronous workflows
- Managing distributed transactions
- Monitoring and debugging queue-based systems

## 🤝 Contributing

This is a practice repository. Feel free to:
- Add more services (e.g., shipping, notifications)
- Implement error handling and dead-letter queues
- Add monitoring and logging
- Experiment with different AWS configurations

## 📄 License

ISC License - See individual service package.json files

---

**Author**: Ali Khan  
**Purpose**: Learning distributed systems and microservices architecture
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