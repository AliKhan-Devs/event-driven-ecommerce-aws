# Event-Driven E-Commerce Microservices with SAGA Pattern

A distributed transaction implementation using the **SAGA pattern** with AWS SNS and SQS. This project demonstrates how to maintain data consistency across multiple microservices through choreography-based SAGA, ensuring reliable order processing in an e-commerce system.

## 🏗️ Architecture Overview

This project implements a **Choreography-based SAGA pattern** where:
- **Order Service** initiates a transaction by publishing an `ORDER_CREATED` event
- **Payment Service** listens and processes payment, then publishes `PAYMENT_COMPLETED` or `PAYMENT_FAILED`
- **Inventory Service** listens and updates inventory, then publishes `INVENTORY_UPDATED` or `INVENTORY_FAILED`
- Services handle compensation (rollback) when failures occur

```
Client Request
     ↓
Order Service (Creates Order)
     ↓ (Publishes ORDER_CREATED event to SNS)
SNS Topic
     ↓ (Fan-out to SQS Queues)
     ├─ Payment SQS → Payment Service → (Success: PAYMENT_COMPLETED or Failure: PAYMENT_FAILED)
     └─ Inventory SQS → Inventory Service → (Success: INVENTORY_UPDATED or Failure: INVENTORY_FAILED)
     ↓ (All services publish completion/failure events back to SNS)
SAGA Completion (All steps succeed) or Rollback (Any step fails)
```

### Key Concepts Demonstrated
- **SAGA Pattern**: Distributed transaction management across services
- **Choreography-based SAGA**: Services coordinate through events without a central orchestrator
- **Compensating Transactions**: Automatic rollback on failure (payment reversal, inventory restoration)
- **Eventual Consistency**: Data consistency achieved through event-driven coordination
- **Asynchronous Processing**: Non-blocking, message-driven workflow
- **Microservices Communication**: Decoupled via events (SNS/SQS)
- **Database per Service**: Independent MongoDB instances with isolated data
- **Fault Tolerance**: Message retry and dead-letter queues for failed transactions

## 📦 Services

### 1. Order Service (SAGA Initiator)
- **Port**: 4000
- **Responsibilities**:
  - Exposes REST API for order creation
  - Creates order record with status `PENDING`
  - Publishes `ORDER_CREATED` event to SNS (SAGA begins)
  - Listens for `PAYMENT_COMPLETED` event to proceed
  - Listens for any service failure events to trigger compensation
  - Updates order status to `COMPLETED` or `FAILED`
- **Technologies**: Node.js, Express, MongoDB, AWS SNS SDK
- **SAGA Role**: Transaction Initiator and Coordinator

### 2. Payment Service (SAGA Step 1)
- **Port**: 5000
- **Responsibilities**:
  - Consumes `ORDER_CREATED` events from Payment SQS queue
  - Processes payment asynchronously
  - Stores payment records with status `PENDING`
  - On Success: Publishes `PAYMENT_COMPLETED` event to SNS
  - On Failure: Publishes `PAYMENT_FAILED` event (triggers compensation)
  - Handles compensation: Reverts payment if subsequent steps fail
  - Updates payment status to `SUCCESS` or `FAILED`
- **Technologies**: Node.js, MongoDB, AWS SQS SDK
- **SAGA Role**: First transaction step with compensation logic

### 3. Inventory Service (SAGA Step 2)
- **Port**: 6000
- **Responsibilities**:
  - Consumes `PAYMENT_COMPLETED` events from Inventory SQS queue
  - Updates inventory stock levels
  - Handles stock deduction logic
  - On Success: Publishes `INVENTORY_UPDATED` event to SNS
  - On Failure: Publishes `INVENTORY_FAILED` event (triggers compensation)
  - Handles compensation: Restores inventory if transaction fails
  - Maintains inventory audit logs
- **Technologies**: Node.js, MongoDB, AWS SQS SDK
- **SAGA Role**: Second transaction step with compensation logic

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

### Create an Order (Start SAGA Transaction)
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

### Expected SAGA Flow (Happy Path)
1. **Step 1**: Order Service creates order with status `PENDING`
2. **Step 2**: Order Service publishes `ORDER_CREATED` event to SNS
3. **Step 3**: Payment Service receives event, processes payment
   - On Success: Publishes `PAYMENT_COMPLETED` event
4. **Step 4**: Inventory Service receives `PAYMENT_COMPLETED` event, updates stock
   - On Success: Publishes `INVENTORY_UPDATED` event
5. **Step 5**: Order Service receives `INVENTORY_UPDATED` event, updates order to `COMPLETED`
6. **Result**: Transaction is committed across all services

### SAGA Rollback Flow (Failure Scenario)
**If Payment fails**:
1. Payment Service publishes `PAYMENT_FAILED` event
2. Order Service receives failure event, updates order to `FAILED`
3. No compensation needed (payment didn't succeed)

**If Inventory fails**:
1. Inventory Service publishes `INVENTORY_FAILED` event
2. Payment Service receives failure event, initiates compensation (payment reversal)
3. Order Service receives failure event, updates order to `FAILED`
4. All partial changes are rolled back

Check service logs to see complete transaction flow and any rollbacks.

## 📊 SAGA Pattern Details

### Choreography-based SAGA
This implementation uses **event-driven choreography** where:
- Services publish domain events when local transactions complete
- Other services subscribe to events and perform compensating transactions if needed
- No central orchestrator; coordination happens through events
- Eventual consistency is achieved through the complete event sequence

### Event Types

| Event | Producer | Consumer | Purpose |
|-------|----------|----------|---------|
| `ORDER_CREATED` | Order Service | Payment Service, Inventory Service | Initiates SAGA transaction |
| `PAYMENT_COMPLETED` | Payment Service | Inventory Service, Order Service | Confirms payment step |
| `PAYMENT_FAILED` | Payment Service | Order Service | Signals payment failure |
| `INVENTORY_UPDATED` | Inventory Service | Order Service | Confirms inventory step, completes SAGA |
| `INVENTORY_FAILED` | Inventory Service | Payment Service, Order Service | Signals inventory failure |

### Compensating Transactions

| Failure Point | Compensation | Service Responsible |
|---|---|---|
| Payment fails | None (payment not charged) | Payment Service |
| Inventory fails | Payment reversal + refund | Payment Service |
| Service unavailable | Retry via SQS queue | Respective Service |

### Data Consistency Model
- **Consistency Level**: Eventual consistency with strong consistency guarantees
- **Transaction Isolation**: Each service manages its own transaction isolation
- **Visibility**: Incomplete transactions remain visible with explicit status (`PENDING`, `FAILED`)

## 📸 Screenshots

### AWS Console Dashboards
- **SNS Topic**: [pictures/sns.png](pictures/sns.png) - Shows topic configuration and subscriptions
- **SQS Queues**: [pictures/sqs.png](pictures/sqs.png) - Displays queue metrics and messages

### Service Consoles
- **Order Service**: [pictures/order-service.png](pictures/order-service.png) - API request handling
- **Payment Service**: [pictures/payment_service.png](pictures/payment_service.png) - Queue message processing
- **Inventory Service**: [pictures/inventory_service.png](pictures/inventory_service.png) - Stock updates

## 🔧 SAGA Pattern Development Notes

### Key Implementation Considerations

1. **Idempotency**: All operations must be idempotent
   - Each service should store processed event IDs to prevent duplicate processing
   - Retried messages should produce the same result

2. **Event Ordering**: Maintain message order per order transaction
   - Use order ID as partition key in SQS for ordering guarantees
   - Process events sequentially for the same transaction

3. **Compensating Transactions**:
   - Payment Service stores original transaction ID for reversals
   - Inventory Service maintains rollback information
   - Both services should log compensation attempts for debugging

4. **Status Tracking**:
   - Order: `PENDING` → `COMPLETED` or `FAILED`
   - Payment: `PENDING` → `SUCCESS` or `FAILED`
   - Inventory: `PENDING` → `COMPLETED` or `FAILED`

5. **Error Handling Strategy**:
   - Transient errors: Retry with exponential backoff
   - Permanent errors: Publish failure event for compensation
   - Use dead-letter queues for unrecoverable failures

6. **Monitoring & Observability**:
   - Log every event published and consumed
   - Track transaction lifecycle with transaction IDs
   - Monitor queue depths for bottlenecks
   - Alert on compensation events (indicates failures)

## 📚 Learning Outcomes

This project helps understand:
- Implementing distributed transactions with SAGA pattern
- Choreography-based SAGA vs Orchestration-based SAGA
- Compensating transactions and rollback mechanisms
- Event-driven microservices architecture
- Eventual consistency in distributed systems
- Handling failures in multi-step workflows
- Pub/sub patterns with SNS/SQS
- Idempotent message processing
- Monitoring distributed transactions

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

## 📊 SAGA Transaction Event Flow

### Complete Order Processing Workflow

```
Customer creates order
        ↓
   Order Service
   - Store order (PENDING)
   - Publish: ORDER_CREATED
        ↓ SNS → SQS fan-out
   ├─→ Payment Service Queue
   │   - Process payment
   │   - On Success: Publish PAYMENT_COMPLETED
   │   - On Failure: Publish PAYMENT_FAILED + Stop
   │
   └─→ (Parallel processing possible)
   
        ↓
   Payment Service
   - Publishes PAYMENT_COMPLETED → SNS
        ↓ SNS → SQS
   Inventory Service Queue
   - Update inventory
   - On Success: Publish INVENTORY_UPDATED
   - On Failure: Publish INVENTORY_FAILED
        
        ↓
   Inventory Service
   - Publishes INVENTORY_UPDATED → SNS
        ↓
   Order Service
   - Receives INVENTORY_UPDATED
   - Update order status: COMPLETED
   - SAGA Transaction Committed ✓
```

### Failure Compensation Flow

```
If any step fails:
   ↓
Compensation begins
   - Payment Service: Revert payment
   - Inventory Service: Restore inventory
   - Order Service: Mark order FAILED
   ↓
SAGA Transaction Rolled Back ✓
```

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

## ✅ SAGA Pattern Advantages & Challenges

### Advantages
- ✓ **Decoupled Services**: Services don't call each other directly
- ✓ **Scalability**: Each service scales independently
- ✓ **Resilience**: Partial failures don't break the entire system
- ✓ **Flexibility**: Easy to add/modify compensation logic

### Challenges & Solutions
| Challenge | Solution Implemented |
|-----------|---------------------|
| Distributed Complexity | Clear event contracts and logging |
| Eventual Consistency | Status tracking and idempotency |
| Rollback Coordination | Compensating transaction events |
| Debugging | Transaction trace IDs across services |
| Message Ordering | Order-based partitioning in SQS |

---

## 🧪 Sample Event Payloads

### ORDER_CREATED Event
```json
{
  "eventType": "OrderCreated",
  "transactionId": "txn-12345",
  "orderId": "order-67890",
  "customerId": "cust-111",
  "items": [
    {
      "productId": "prod-123",
      "quantity": 2,
      "price": 49.99
    }
  ],
  "totalAmount": 99.99,
  "timestamp": "2026-03-11T10:30:00Z"
}
```

### PAYMENT_COMPLETED Event
```json
{
  "eventType": "PaymentCompleted",
  "transactionId": "txn-12345",
  "orderId": "order-67890",
  "paymentId": "pay-999",
  "amount": 99.99,
  "paymentMethod": "credit_card",
  "status": "SUCCESS",
  "timestamp": "2026-03-11T10:31:00Z"
}
```

### INVENTORY_UPDATED Event
```json
{
  "eventType": "InventoryUpdated",
  "transactionId": "txn-12345",
  "orderId": "order-67890",
  "items": [
    {
      "productId": "prod-123",
      "quantity": 2,
      "newStock": 48
    }
  ],
  "status": "SUCCESS",
  "timestamp": "2026-03-11T10:32:00Z"
}
```

### PAYMENT_FAILED Event (Compensation Trigger)
```json
{
  "eventType": "PaymentFailed",
  "transactionId": "txn-12345",
  "orderId": "order-67890",
  "reason": "Insufficient funds",
  "status": "FAILED",
  "timestamp": "2026-03-11T10:31:30Z"
}
```