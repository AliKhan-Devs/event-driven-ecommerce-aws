import { Order } from "../models/order.model";
import { publishOrder } from "../publisher/publish";

export const createOrder = async (data) => {
  const orderId = uuidv4();
  const { amount, items } = data;
  const order = await Order.create({ orderId, amount, items, status: "PENDING" });
  // create event object and publish to SNS
  const event = {
    eventType: "ORDER_CREATED",
    orderId,
    amount,
    items,
    createdAt: new Date(),
  };
  await publishOrder(event);
  return order;
};

export const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findOneAndUpdate({ orderId }, { status }, { new: true });
  return order;
};


// delete order status to failed in case of inventory failure or payment failure
export const revertOrder = async (orderId) => {
  // delete from database 
  await Order.findOneAndDelete({ orderId });
  // or update status to failed
  // const order = await Order.findOneAndUpdate({ orderId }, { status: "FAILED" }, { new: true });
  // return order;

};