'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

export async function getProductStock(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { quantity: true }
  });
  return product?.quantity || 0;
}

async function processDeliveryPhoto(imageData: string | null | undefined): Promise<string> {
  if (!imageData?.startsWith('data:image/')) {
    return imageData || '';
  }

  try {
    const [header, base64Data] = imageData.split(',');
    const extension = header.split(';')[0].split('/')[1] || 'jpg';
    const fileName = `delivery-${randomBytes(8).toString('hex')}.${extension}`;
    const publicPath = path.join(process.cwd(), 'public', 'uploads', 'delivery');
    
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true });
    }

    const filePath = path.join(publicPath, fileName);
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    
    return `/uploads/delivery/${fileName}`;
  } catch (error) {
    console.error('Error saving delivery photo:', error);
    return '';
  }
}

async function processImage(imageData: string | null | undefined): Promise<string> {
  // If not a base64 Data URL, return as is (could be an existing path or external URL)
  if (!imageData?.startsWith('data:image/')) {
    return imageData || '';
  }

  try {
    const [header, base64Data] = imageData.split(',');
    const regex = /data:image\/([a-zA-Z+]+);base64/;
    const match = regex.exec(header);
    if (!match) return imageData;
    
    let extension = match[1];
    if (extension === 'jpeg') extension = 'jpg';
    
    const fileName = `product-${randomBytes(8).toString('hex')}.${extension}`;
    const publicPath = path.join(process.cwd(), 'public', 'images', 'products');
    
    // Ensure directory exists
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true });
    }

    const filePath = path.join(publicPath, fileName);
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    
    return `/images/products/${fileName}`;
  } catch (error) {
    console.error('Error saving uploaded image:', error);
    return imageData; // Fallback to original
  }
}

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Revalidation skipped for ${path}: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }
}

async function trackAction(name: string) {
  try {
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const agent = headerList.get('user-agent') || 'Unknown';
    
    await prisma.trafficRecord.create({
      data: {
        path: `/api/${name}`,
        ip,
        userAgent: agent,
        device: 'Action',
        country: 'India',
        city: 'Server',
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Traffic tracking failed for ${name}:`, error);
    }
  }
}

export async function getProducts() {
  trackAction('getProducts');
  try {
    return await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error in getProducts:', error);
    return [];
  }
}

export async function updateProduct(id: string, data: any) {
  trackAction('updateProduct');
  const price = Number.parseFloat(data.price);
  const quantity = Number.parseInt(data.quantity) || 0;

  if (price < 0) throw new Error("Price cannot be less than zero");
  if (quantity < 0) throw new Error("Quantity cannot be less than zero");

  // Get current product state for inventory logging
  const currentProduct = await prisma.product.findUnique({
    where: { id },
    select: { quantity: true, name: true }
  });

  // Process images to save them to static folder if they are base64 uploads
  const processedImages = await Promise.all(
    (data.images || []).map((img: string) => processImage(img))
  );

  const mainImage = processedImages.length > 0 
    ? processedImages[0] 
    : await processImage(data.image);

  const result = await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      price: price,
      originalPrice: data.originalPrice ? Math.max(0, Number.parseFloat(data.originalPrice)) : null,
      rating: data.rating === undefined ? undefined : Number.parseFloat(data.rating),
      reviewCount: data.reviewCount === undefined ? undefined : Number.parseInt(data.reviewCount),
      category: data.category,
      brand: data.brand,
      ageGroup: data.ageGroup,
      inStock: data.inStock,
      isNew: data.isNew,
      discount: data.discount ? Number.parseInt(data.discount) : 0,
      description: data.description,
      features: data.features,
      quantity: quantity,
      returnPolicy: data.returnPolicy || "NONE",
      image: mainImage,
      images: processedImages,
    },
  });

  // Log inventory change if quantity changed
  if (currentProduct && currentProduct.quantity !== quantity) {
    const diff = quantity - currentProduct.quantity;
    await prisma.inventoryLog.create({
      data: {
        productId: id,
        productName: result.name,
        oldQuantity: currentProduct.quantity,
        newQuantity: quantity,
        change: diff,
        type: diff > 0 ? 'RESTOCK' : 'ADJUSTMENT',
      }
    });
  }

  safeRevalidate('/admin/products');
  safeRevalidate('/admin/inventory-logs');
  safeRevalidate('/product-catalog');
  safeRevalidate('/');
  return result;
}

export async function restockProduct(productId: string, quantityToAdd: number) {
  trackAction('restockProduct');
  const quantity = Math.max(0, Number.parseInt(quantityToAdd.toString()));
  if (quantity === 0) return;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, quantity: true }
  });

  if (!product) throw new Error("Product not found");

  const newQuantity = product.quantity + quantity;

  const result = await prisma.product.update({
    where: { id: productId },
    data: {
      quantity: newQuantity,
      inStock: true
    }
  });

  await prisma.inventoryLog.create({
    data: {
      productId: product.id,
      productName: product.name,
      oldQuantity: product.quantity,
      newQuantity: newQuantity,
      change: quantity,
      type: 'RESTOCK',
    }
  });

  safeRevalidate('/admin/products');
  safeRevalidate('/admin/inventory-logs');
  return result;
}

export async function deleteProduct(id: string) {
  trackAction('deleteProduct');
  const result = await prisma.product.delete({
    where: { id },
  });
  safeRevalidate('/admin/products');
  safeRevalidate('/product-catalog');
  safeRevalidate('/');
  return result;
}

export async function createProduct(data: any) {
  trackAction('createProduct');
  const price = Number.parseFloat(data.price);
  const quantity = Number.parseInt(data.quantity) || 0;

  if (price < 0) throw new Error("Price cannot be less than zero");
  if (quantity < 0) throw new Error("Quantity cannot be less than zero");

  // Process images to save them to static folder if they are base64 uploads
  const processedImages = await Promise.all(
    (data.images || []).map((img: string) => processImage(img))
  );
  
  const mainImage = processedImages.length > 0 
    ? processedImages[0] 
    : await processImage(data.image || '/images/products/product-1.jpg');

  const result = await prisma.product.create({
    data: {
      name: data.name,
      price: price,
      originalPrice: data.originalPrice ? Math.max(0, Number.parseFloat(data.originalPrice)) : null,
      rating: data.rating ? Number.parseFloat(data.rating) : 4.5,
      reviewCount: data.reviewCount ? Number.parseInt(data.reviewCount) : 0,
      category: data.category,
      brand: data.brand,
      ageGroup: data.ageGroup,
      inStock: data.inStock,
      isNew: data.isNew,
      discount: data.discount ? Number.parseInt(data.discount) : 0,
      description: data.description,
      features: data.features || [],
      quantity: quantity,
      returnPolicy: data.returnPolicy || "NONE",
      image: mainImage,
      images: processedImages,
    },
  });

  // Log initial inventory
  if (quantity > 0) {
    await prisma.inventoryLog.create({
      data: {
        productId: result.id,
        productName: result.name,
        oldQuantity: 0,
        newQuantity: quantity,
        change: quantity,
        type: 'INITIAL_STOCK',
      }
    });
  }

  safeRevalidate('/admin/products');
  safeRevalidate('/admin/inventory-logs');
  safeRevalidate('/product-catalog');
  safeRevalidate('/');
  return result;
}

export async function getOrders() {
  trackAction('getOrders');
  const [orders, staffMembers] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        items: true, 
        transaction: true,
        statusHistory: {
          orderBy: { timestamp: 'desc' }
        }
      },
    }),
    prisma.user.findMany({
      where: {
        role: { in: ['shipment', 'delivery_champion', 'shopkeeper', 'admin', 'inventory_manager'] }
      },
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        phone: true,
        role: true
      }
    })
  ]);

  // Join staff data in memory to avoid Prisma Client synchronization issues with relations
  return orders.map((order: any) => {
    const o = order;
    return {
      ...o,
      assignedDelivery: staffMembers.find((s: any) => s.id === o.assignedDeliveryId),
      assignedShipment: staffMembers.find((s: any) => s.id === o.assignedShipmentId),
      sourceStaff: staffMembers.find((s: any) => s.id === o.sourceStaffId)
    };
  });
}

export async function getCarriers() {
  const carriers = await prisma.carrier.findMany();
  if (carriers.length === 0) {
    await prisma.carrier.create({ data: { name: 'Self' } });
    return await prisma.carrier.findMany();
  }
  return carriers;
}

export async function createCarrier(name: string) {
  const result = await prisma.carrier.create({ data: { name } });
  safeRevalidate('/admin/delivery');
  return result;
}

export async function deleteCarrier(id: string) {
  await prisma.carrier.delete({ where: { id } });
  safeRevalidate('/admin/delivery');
}

// Product Categories
export async function getProductCategories() {
  return await prisma.productCategory.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function createProductCategory(name: string) {
  const result = await prisma.productCategory.create({
    data: { name },
  });
  safeRevalidate('/admin/products/new');
  return result;
}

export async function deleteProductCategory(id: string) {
  const category = await prisma.productCategory.findUnique({
    where: { id },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  const productCount = await prisma.product.count({
    where: { category: category.name },
  });

  if (productCount > 0) {
    throw new Error(`Cannot delete category "${category.name}" because it has ${productCount} associated products.`);
  }

  const result = await prisma.productCategory.delete({
    where: { id },
  });
  safeRevalidate('/admin/products/new');
  return result;
}

export async function getUserAddresses(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { addresses: true },
  });
  return user?.addresses || [];
}

export async function updateUserProfile(email: string, data: {
  name?: string;
  phone?: string;
  gender?: string;
  avatar?: string;
  isActive?: boolean;
}) {
  const result = await prisma.user.update({
    where: { email },
    data: {
      name: data.name,
      phone: data.phone,
      gender: data.gender,
      avatar: data.avatar,
      isActive: data.isActive,
    },
  });
  safeRevalidate('/account-dashboard');
  safeRevalidate('/admin/users');
  return result;
}

export async function initializeStaffAccounts() {
  const staff = [
    { email: 'shopkeeper@toyshop.com', name: 'Shop Keeper', role: 'shopkeeper' },
    { email: 'inventory@toyshop.com', name: 'Inventory Manager', role: 'inventory_manager' },
  ];

  for (const s of staff) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: { role: s.role },
      create: {
        email: s.email,
        name: s.name,
        role: s.role,
        password: 'staffpassword', // Default, though they can use master admin123
        isActive: true
      }
    });
  }
}

export async function addAddress(email: string, data: any) {
  const user = await prisma.user.findUnique({ where: { email } });
  
  // If user is not found (stale session), don't crash. 
  // Return the data as a transient address so checkout can proceed.
  if (!user) {
    return {
      id: `temp-${Date.now()}`,
      ...data,
      userId: null,
    };
  }

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
  }

  const result = await prisma.address.create({
    data: {
      user: { connect: { id: user.id } },
      fullName: data.fullName,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      country: data.country || "India",
      zipCode: data.zipCode,
      phone: data.phone,
      isDefault: data.isDefault || false,
    },
  });
  
  safeRevalidate('/account-dashboard');
  safeRevalidate('/checkout');
  return result;
}

export async function deleteAddress(id: string) {
  // Don't attempt to delete transient addresses from DB
  if (id.startsWith('temp-') || id.startsWith('guest-')) {
    return;
  }
  
  try {
    await prisma.address.delete({ where: { id } });
  } catch (error) {
    console.error('Failed to delete address:', error);
  }
  
  safeRevalidate('/account-dashboard');
  safeRevalidate('/checkout');
}

export async function createOrder(data: any) {
  trackAction('createOrder');
  let finalUserId = data.customerId;
  const isPOS = data.source === 'POS';

  // Validate user exists if customerId is provided
  if (finalUserId) {
    const user = await prisma.user.findUnique({
      where: { id: finalUserId },
      select: { id: true },
    });
    if (!user) {
      finalUserId = null;
    }
  }

  return await prisma.$transaction(async (tx: any) => {
    // 1. Create the order
      const deliveryOTP = Math.floor(1000 + Math.random() * 9000).toString();
      const finalOrderData: any = {
        total: Number(data.total),
        taxAmount: Number(data.taxAmount || 0),
        shippingCost: Number(data.shippingCost || 0),
        shippingAddress: data.shippingAddress || (isPOS ? 'Physical Store Sale' : 'No Address Provided'),
        paymentMethod: data.paymentMethod || (isPOS ? 'Cash' : 'Credit Card'),
        status: isPOS ? 'Delivered' : 'Processing',
        customerName: data.customerName || 'Walk-in Customer',
        email: data.customerEmail || null,
        items: {
          create: data.items.map((item: any) => ({
            productId: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            image: item.image,
            returnPolicy: item.returnPolicy || "NONE",
          }))
        }
      };

      if (finalUserId) {
        finalOrderData.user = { connect: { id: finalUserId } };
      }

      const order = await tx.order.create({
        data: finalOrderData,
        include: {
          items: true
        }
      });

      // Bypassing stale Prisma client validation using raw SQL for newly added fields
      try {
        await tx.$executeRawUnsafe(
          `UPDATE "Order" SET "source" = $1, "sourceStaffId" = $2, "customerPhone" = $3, "paymentCollected" = $4, "deliveryOTP" = $5 WHERE "id" = $6`,
          data.source || 'ONLINE',
          data.sourceStaffId || null,
          data.customerPhone || null,
          isPOS,
          isPOS ? null : deliveryOTP,
          order.id
        );
      } catch (e) {
        console.error('Failed to set extended order fields (client might be very stale):', e);
      }

      // 2. Reduce inventory immediately for POS
      if (isPOS) {
        await reduceOrderInventory(tx, order.id, 'POS_SALE');
      }

      // Update coupon usage count if applied
      if (data.promoCode) {
        await tx.coupon.update({
          where: { code: data.promoCode.toUpperCase() },
          data: { usageCount: { increment: 1 } }
        }).catch((err: any) => console.error('Coupon use-count increment failed:', err));
      }

      // Initialize status history
      await tx.orderHistory.create({
        data: {
          order: { connect: { id: order.id } },
          status: isPOS ? 'Delivered' : 'Processing',
          note: isPOS ? 'Direct Sale in Shop' : 'Order placed successfully'
        }
      });

      // 2. Create the associated transaction
    const finalTransactionData: any = {
      order: { connect: { id: order.id } },
      amount: Number(data.total),
      paymentMethod: data.paymentMethod || 'COD',
      status: (() => {
        if (data.paymentMethod === 'cod' || data.paymentMethod === 'Cash on Delivery') return 'COD_Pending';
        if (data.paymentMethod === 'phonepay') return 'Success';
        return 'Pending';
      })(),
      transactionId: data.transactionId || (data.paymentMethod === 'phonepay' ? `PP${Date.now()}` : null),
      paymentDetails: data.paymentDetails || {}
    };

    if (finalUserId) {
      finalTransactionData.user = { connect: { id: finalUserId } };
    }

    await tx.transaction.create({
      data: finalTransactionData
    });

    safeRevalidate('/admin/orders');
    safeRevalidate('/admin/products');
    safeRevalidate('/admin/inventory-logs');
    return order;
  });
}

// Helper for restocking items when order is cancelled or returned
async function restockOrderItems(tx: any, orderId: string, type: 'RETURN' | 'CANCELLED_ORDER') {
  const orderWithItems = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });
  
  if (!orderWithItems) return;

  for (const item of orderWithItems.items) {
    if (!item.productId) continue;

    const prod = await tx.product.findUnique({ where: { id: item.productId } });
    await tx.product.update({
      where: { id: item.productId },
      data: {
        quantity: { increment: item.quantity },
        inStock: true,
      },
    });

    // Log inventory change
    await tx.inventoryLog.create({
      data: {
        productId: item.productId,
        productName: item.name,
        oldQuantity: prod?.quantity || 0,
        newQuantity: (prod?.quantity || 0) + item.quantity,
        change: item.quantity,
        type,
      }
    });
  }
}

async function reduceOrderInventory(tx: any, orderId: string, type: string) {
  const orderWithItems = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });
  
  if (!orderWithItems) return;

  for (const item of orderWithItems.items) {
    if (!item.productId) continue;

    const prod = await tx.product.findUnique({ where: { id: item.productId } });
    if (!prod) continue;

    const newQty = prod.quantity - item.quantity;
    await tx.product.update({
      where: { id: item.productId },
      data: {
        quantity: newQty,
        inStock: newQty > 0,
      },
    });

    // Log inventory change
    await tx.inventoryLog.create({
      data: {
        productId: item.productId,
        productName: item.name,
        oldQuantity: prod.quantity,
        newQuantity: newQty,
        change: -item.quantity,
        type,
      }
    });
  }
}

export async function updateOrder(id: string, data: any) {
    return await prisma.$transaction(async (tx: any) => {
      const currentOrder = await tx.order.findUnique({
        where: { id },
      });

      if (!currentOrder) throw new Error('Order not found');

      // Strip fields that shouldn't go directly to Order model
      const { userId, note, statusHistory, ...rest } = data;
      const finalData: any = { ...rest };
      
      if (userId) {
        finalData.user = { connect: { id: userId } };
      }

      const result = await tx.order.update({
        where: { id },
        data: finalData,
      });

      // Add to status history if status changed
      if (data.status) {
        await tx.orderHistory.create({
          data: {
            order: { connect: { id } },
            status: data.status,
            note: note || `Status updated to ${data.status}`
          }
        });
      }

      // Handle stock reduction when order becomes 'Packed' (for online orders)
      const isBecomingPacked = (data.status === 'Packed' && (currentOrder.status === 'Pending' || currentOrder.status === 'Processing'));
      if (isBecomingPacked) {
        await reduceOrderInventory(tx, id, 'ONLINE_SALE_PACKED');
      }

      // Handle restocking if order is returned or cancelled
      const isReturned = (data.status === 'Returned' && currentOrder.status !== 'Returned');
      const isCancelled = (data.status === 'Cancelled' && currentOrder.status !== 'Cancelled');
      
      if (isReturned || isCancelled) {
        // Only restock if order was already packed/delivered (stock removed)
        const stockRemovedStatuses = ['Packed', 'Shipped', 'Handover', 'Out for Delivery', 'Delivered', 'Returned-With-Driver'];
        if (isReturned || stockRemovedStatuses.includes(currentOrder.status)) {
          await restockOrderItems(tx, id, isReturned ? 'RETURN' : 'CANCELLED_ORDER');
        }
      }

      safeRevalidate('/admin/orders');
      safeRevalidate(`/admin/orders/${id}`);
      safeRevalidate('/admin/products');
      safeRevalidate('/admin/delivery');
      return result;
  });
}

export async function cancelOrder(orderId: string, reason: string) {
  trackAction('cancelOrder');
  return await updateOrder(orderId, {
    status: 'Cancelled',
    cancelReason: reason,
    note: `Order cancelled. Reason: ${reason}`
  });
}

export async function requestReturn(orderId: string, data: { reason: string, type: string }) {
  trackAction('requestReturn');
  
  // 1. Check eligibility
  const order = await prisma.order.findUnique({
     where: { id: orderId },
     include: { items: true }
  });

  if (!order) throw new Error('Order not found');

  // Check if any product in order is eligible for return
  const eligibleItems = order.items.filter((item: any) => item.returnPolicy !== 'NONE');
  if (eligibleItems.length === 0) {
     throw new Error('This order contains no items eligible for return.');
  }

  return await updateOrder(orderId, {
    status: 'Return Requested',
    returnStatus: 'PENDING',
    returnReason: data.reason,
    returnType: data.type,
    note: `Return requested (${data.type}). Reason: ${data.reason}`
  });
}

export async function updateReturnStatus(orderId: string, status: string, note?: string) {
  trackAction('updateReturnStatus');
  
  // Generate security codes if the return is approved by the Admin
  const returnOTP = Math.floor(1000 + Math.random() * 9000).toString();
  const returnHandoverCode = Math.floor(1000 + Math.random() * 9000).toString();

  const updateData: any = { 
    returnStatus: status,
    ...(status === 'APPROVED' ? { 
      returnOTP, 
      returnHandoverCode,
      status: 'Return-Processing' 
    } : {})
  };

  return await updateOrder(orderId, {
    ...updateData,
    note: note || `Return status updated to ${status}`
  });
}

export async function verifyReturnCollection(orderId: string, inputOTP: string, imagePath?: string) {
  trackAction('verifyReturnCollection');
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { returnOTP: true }
  });

  if (order?.returnOTP !== inputOTP) {
    throw new Error('Invalid Return OTP provided by Buyer');
  }

  const result = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'Returned-With-Driver',
      deliveryImage: imagePath,
      statusHistory: {
        create: {
          status: 'Returned-With-Driver',
          note: 'Item collected from customer. Image proof uploaded.'
        }
      }
    }
  });

  safeRevalidate('/delivery');
  safeRevalidate('/shipment');
  return result;
}

export async function verifyReturnToWarehouse(orderId: string, inputCode: string, shipperId: string) {
  trackAction('verifyReturnToWarehouse');
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { returnHandoverCode: true }
  });

  if (order?.returnHandoverCode !== inputCode) {
    throw new Error('Invalid Return Handover code');
  }

  return await prisma.$transaction(async (tx: any) => {
    // A. Update Status
    const result = await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'Returned',
        assignedShipmentId: shipperId, 
        statusHistory: {
          create: {
            status: 'Returned',
            note: `Product received at warehouse. Final restock triggered by Shipper.`
          }
        }
      }
    });

    // B. Automatically restore the stock in PostgreSQL
    await restockOrderItems(tx, orderId, 'RETURN');

    safeRevalidate('/shipment');
    safeRevalidate('/admin/orders');
    return result;
  });
}

export async function updateRefundStatus(orderId: string, data: { status: string, method: string, note?: string }) {
  trackAction('updateRefundStatus');
  const result = await prisma.order.update({
    where: { id: orderId },
    data: {
      returnStatus: data.status,
      refundPaymentMethod: data.method,
      statusHistory: {
        create: {
          status: data.status === 'COMPLETED' ? 'Refunded' : 'Refund Processing',
          note: data.note || `Refund ${data.status} via ${data.method}`
        }
      }
    }
  });
  safeRevalidate('/admin/orders');
  return result;
}

export async function getUserOrders(email: string) {
  try {
    return await prisma.order.findMany({
      where: { email },
      orderBy: { date: 'desc' },
      include: {
        items: true,
        transaction: true,
        statusHistory: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch user orders:', error);
    return [];
  }
}

export async function getInventoryLogs() {
  try {
    return await prisma.inventoryLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100
    });
  } catch (error) {
    console.error('Failed to fetch inventory logs:', error);
    return [];
  }
}

export async function getTrafficRecords() {
  try {
    const [allLogs, totalVisits, uniqueIps, registeredVisits] = await Promise.all([
      prisma.trafficRecord.findMany({
        orderBy: { timestamp: 'desc' },
        take: 1000
      }),
      prisma.trafficRecord.count(),
      prisma.trafficRecord.groupBy({
        by: ['ip']
      }),
      prisma.trafficRecord.count({
        where: { userId: { not: null } }
      })
    ]);

    // Aggregate Top Products
    const productVisits = allLogs.filter((log: any) => log.path.includes('/product-catalog/'));
    const productMap = productVisits.reduce((acc: Record<string, number>, log: any) => {
      acc[log.path] = (acc[log.path] || 0) + 1;
      return acc;
    }, {});
    
    // @ts-ignore
    const topProductPaths = Object.entries(productMap)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 8);

    const productIds = topProductPaths.map(([path]: any) => path.split('/').pop()).filter(Boolean);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds as string[] } },
      select: { id: true, name: true }
    });

    const topProducts = topProductPaths.map(([path, count]: any) => {
      const id = path.split('/').pop();
      const product = products.find((p: any) => p.id === id);
      return { 
        name: product ? product.name : (id || path), 
        count,
        id 
      };
    });
    
    // Aggregate Active Users
    const userMap = allLogs.filter((log: any) => log.userEmail).reduce((acc: Record<string, number>, log: any) => {
      acc[log.userEmail!] = (acc[log.userEmail!] || 0) + 1;
      return acc;
    }, {});

    // @ts-ignore
    const topUsers = Object.entries(userMap)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5)
      .map(([email, count]: any) => ({ email, count }));

    // Aggregate Top APIs/Actions
    const apiVisits = allLogs.filter((log: any) => log.path.startsWith('/api/'));
    const apiMap = apiVisits.reduce((acc: Record<string, number>, log: any) => {
      acc[log.path] = (acc[log.path] || 0) + 1;
      return acc;
    }, {});
    // @ts-ignore
    const topApis = Object.entries(apiMap)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5)
      .map(([path, count]: any) => ({ path: path.replace('/api/', ''), count }));

    // Generate accurate trends using granular data
    const now = new Date();
    
    // 1. Day Trend (Hourly - last 24 hours)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const dayTrendData = await prisma.trafficRecord.findMany({
      where: { timestamp: { gte: twentyFourHoursAgo } },
      select: { timestamp: true }
    });
    const dayTrendMap: Record<string, number> = {};
    for (let i = 0; i < 24; i++) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      dayTrendMap[d.getHours() + ":00"] = 0;
    }
    dayTrendData.forEach((log: any) => {
      const hour = new Date(log.timestamp).getHours() + ":00";
      if (dayTrendMap[hour] !== undefined) dayTrendMap[hour]++;
    });
    const dayTrend = Object.entries(dayTrendMap).map(([date, count]) => ({ date, count })).reverse();

    // 2. Week Trend (Daily - last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekTrendData = await prisma.trafficRecord.findMany({
      where: { timestamp: { gte: sevenDaysAgo } },
      select: { timestamp: true }
    });
    const weekTrendMap: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
       const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
       weekTrendMap[d.toISOString().split('T')[0]] = 0;
    }
    weekTrendData.forEach((log: any) => {
       const day = new Date(log.timestamp).toISOString().split('T')[0];
       if (weekTrendMap[day] !== undefined) weekTrendMap[day]++;
    });
    const weekTrend = Object.entries(weekTrendMap).map(([date, count]) => ({ date, count })).sort((a,b) => a.date.localeCompare(b.date));

    // 3. Month Trend (Daily - last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthTrendData = await prisma.trafficRecord.findMany({
      where: { timestamp: { gte: thirtyDaysAgo } },
      select: { timestamp: true }
    });
    const monthTrendMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
       const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
       monthTrendMap[d.toISOString().split('T')[0]] = 0;
    }
    monthTrendData.forEach((log: any) => {
       const day = new Date(log.timestamp).toISOString().split('T')[0];
       if (monthTrendMap[day] !== undefined) monthTrendMap[day]++;
    });
    const monthTrend = Object.entries(monthTrendMap).map(([date, count]) => ({ date, count })).sort((a,b) => a.date.localeCompare(b.date));

    // 4. Year Trend (Monthly - last 12 months)
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const yearTrendData = await prisma.trafficRecord.findMany({
      where: { timestamp: { gte: oneYearAgo } },
      select: { timestamp: true }
    });
    const yearTrendMap: Record<string, number> = {};
    for (let i = 0; i < 12; i++) {
       const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
       const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
       yearTrendMap[key] = 0;
    }
    yearTrendData.forEach((log: any) => {
       const date = new Date(log.timestamp);
       const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
       if (yearTrendMap[key] !== undefined) yearTrendMap[key]++;
    });
    const yearTrend = Object.entries(yearTrendMap).map(([date, count]) => ({ date, count })).sort((a,b) => a.date.localeCompare(b.date));

    return {
      logs: allLogs.slice(0, 100),
      stats: {
        totalVisits,
        uniqueVisitors: uniqueIps.length,
        registeredVisits,
        guestVisits: totalVisits - registeredVisits
      },
      analytics: {
        topProducts,
        topUsers,
        trend: weekTrend, // Fallback for stability
        trends: {
          day: dayTrend,
          week: weekTrend,
          month: monthTrend,
          year: yearTrend
        },
        topApis
      }
    };
  } catch (error) {
    console.error('Failed to fetch traffic records:', error);
    return { 
      logs: [], 
      stats: { totalVisits: 0, uniqueVisitors: 0, registeredVisits: 0, guestVisits: 0 },
      analytics: { topProducts: [], topUsers: [], trend: [], topApis: [] }
    };
  }
}

export async function getOrder(id: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: true,
        transaction: true,
        statusHistory: {
          orderBy: {
            timestamp: 'desc'
          }
        },
      },
    });

    if (!order) return null;

    // Fetch related staff members manually to avoid Prisma relation sync issues
    const staffIds = [
      order.assignedDeliveryId,
      order.assignedShipmentId,
      order.sourceStaffId
    ].filter(Boolean);

    let staffMembers: any[] = [];
    if (staffIds.length > 0) {
      staffMembers = await prisma.user.findMany({
        where: { id: { in: (staffIds as string[]) } },
        select: {
          id: true,
          name: true,
          lastName: true,
          email: true,
          phone: true,
          role: true
        }
      });
    }

    return {
      ...order,
      assignedDelivery: staffMembers.find(s => s.id === order.assignedDeliveryId),
      assignedShipment: staffMembers.find(s => s.id === order.assignedShipmentId),
      sourceStaff: staffMembers.find(s => s.id === order.sourceStaffId)
    };
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return null;
  }
}

export async function getCustomers() {
  const users = await prisma.user.findMany({
    where: {
      role: 'user'
    },
    include: {
      orders: true,
    },
  });

  const orders = await prisma.order.findMany();
  
  // Map users to customer interface
  const userCustomers = users.map((user: any) => {
    const totalSpent = user.orders.reduce((sum: number, o: any) => sum + o.total, 0);
    const lastOrderDate = user.orders.length > 0 
      ? new Date(Math.max(...user.orders.map((o: any) => new Date(o.date).getTime()))).toISOString()
      : 'N/A';
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      orders: user.orders.length,
      totalSpent,
      lastOrder: lastOrderDate,
      role: user.role,
      status: user.orders.length > 0 ? 'Active' : 'New',
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
    };
  });

  // Find guest customers (orders without customerId)
  const guestOrders = orders.filter((o: any) => !o.userId);
  const uniqueGuestEmails = Array.from(new Set(guestOrders.map((o: any) => o.email)));
  
  const guestCustomers = uniqueGuestEmails.map((email: any, index: number) => {
    const customerOrders = guestOrders.filter((o: any) => o.email === email);
    const name = customerOrders[0].customerName || 'Guest';
    const totalSpent = customerOrders.reduce((sum: number, o: any) => sum + o.total, 0);
    const lastOrderDate = new Date(Math.max(...customerOrders.map((o: any) => new Date(o.date || Date.now()).getTime()))).toISOString();
    
    return {
      id: `GUEST-${index}`,
      name,
      email: email as string,
      orders: customerOrders.length,
      totalSpent,
      lastOrder: lastOrderDate,
      status: 'Active',
      avatar: `https://i.pravatar.cc/150?u=${email}`,
    };
  });

  return [...userCustomers, ...guestCustomers];
}

export async function registerUser(data: {
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  password?: string;
  role?: string;
  avatar?: string;
}) {
  console.log('Registering user with data:', { ...data, password: '***' });
  
  // Check for existing user by email
  const existingUserByEmail = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUserByEmail) {
    throw new Error('Unique constraint failed on the fields: (`email`)');
  }

  // Check for existing user by phone if provided
  if (data.phone) {
    const existingUserByPhone = await prisma.user.findFirst({
      where: { phone: data.phone }
    });

    if (existingUserByPhone) {
      throw new Error('Unique constraint failed on the fields: (`phone`)');
    }
  }

  const result = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      password: data.password, // In a real app, hash this!
      role: data.role || 'user',
      avatar: data.avatar,
      preferences: {
        orderUpdates: true,
        promotions: false,
        stockAlerts: true,
      }
    },
  });
  safeRevalidate('/admin/customers');
  return result;
}

export async function loginUser(identifier: string) {
  const cleanIdentifier = identifier.trim();
  
  // Try email first (case-insensitive), then phone
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: cleanIdentifier, mode: 'insensitive' } },
        { phone: cleanIdentifier }
      ]
    },
  });

  return user;
}

export async function getUserProfile(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      gender: true,
      avatar: true,
      preferences: true,
      createdAt: true,
    }
  });
}

export async function updateUserPreferences(email: string, preferences: any) {
  const result = await prisma.user.update({
    where: { email },
    data: {
      preferences
    },
  });
  safeRevalidate('/account-dashboard');
  return result;
}

// Banners, Deals, Coupons
export async function getBanners() {
  return await prisma.banner.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDeals() {
  return await prisma.deal.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getCoupons() {
  return await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function validateCoupon(code: string) {
  trackAction('validateCoupon');
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() }
  });

  if (!coupon) {
    return { valid: false, message: 'Invalid coupon code' };
  }

  if (coupon.status !== 'Active') {
    return { valid: false, message: 'This coupon is no longer active' };
  }

  if (new Date(coupon.expiry) < new Date()) {
    return { valid: false, message: 'This coupon has expired' };
  }

  return { 
    valid: true, 
    coupon: {
      code: coupon.code,
      discount: coupon.discount,
      type: coupon.type
    }
  };
}

export async function getNavCategories() {
  return await prisma.navCategory.findMany({
    orderBy: { displayOrder: 'asc' },
  });
}

// Payment Methods
export async function getPaymentMethods() {
  const methods = await prisma.paymentMethod.findMany({
    orderBy: { createdAt: 'asc' },
  });

  // Seed default methods if none exist
  if (methods.length === 0) {
    const defaultMethods = [
      { name: 'Cash on Delivery', identifier: 'cod', description: 'Pay when your order arrives', icon: 'BanknotesIcon' },
      { name: 'Credit / Debit Card', identifier: 'card', description: 'Visa, Mastercard, RuPay', icon: 'CreditCardIcon' },
      { name: 'Net Banking', identifier: 'netbanking', description: 'Secure bank transfer', icon: 'BanknotesIcon' },
      { name: 'PhonePay / UPI', identifier: 'phonepay', description: 'UPI, Wallet, GPay', icon: 'DevicePhoneMobileIcon' },
    ];

    for (const m of defaultMethods) {
      await prisma.paymentMethod.create({ data: m });
    }
    return await prisma.paymentMethod.findMany({ orderBy: { createdAt: 'asc' } });
  }

  return methods;
}

export async function updatePaymentMethod(id: string, data: any) {
  const result = await prisma.paymentMethod.update({
    where: { id },
    data,
  });
  safeRevalidate('/admin/settings/payments');
  safeRevalidate('/checkout');
  return result;
}

export async function createPaymentMethod(data: any) {
  const result = await prisma.paymentMethod.create({
    data,
  });
  safeRevalidate('/admin/settings/payments');
  return result;
}

export async function deletePaymentMethod(id: string) {
  const result = await prisma.paymentMethod.delete({
    where: { id },
  });
  safeRevalidate('/admin/settings/payments');
  return result;
}

export async function recordTraffic(data: {
  path: string;
  userId?: string;
  userName?: string;
  ip?: string;
  country?: string;
  city?: string;
  device?: string;
  userAgent?: string;
  userEmail?: string;
}) {
  try {
    return await prisma.trafficRecord.create({
      data: {
        path: data.path,
        userId: data.userId,
        userName: data.userName,
        ip: data.ip,
        country: data.country,
        city: data.city,
        device: data.device,
        userAgent: data.userAgent,
        userEmail: data.userEmail,
      },
    });
  } catch (error) {
    console.error('Failed to record traffic:', error);
  }
}

export async function createBanner(data: any) {
  const result = await prisma.banner.create({ data });
  safeRevalidate('/');
  safeRevalidate('/admin/promotions');
  return result;
}

export async function deleteBanner(id: string) {
  await prisma.banner.delete({ where: { id } });
  safeRevalidate('/');
  safeRevalidate('/admin/promotions');
}

export async function createCoupon(data: any) {
  const result = await prisma.coupon.create({
    data: {
      ...data,
      code: data.code.toUpperCase(),
      expiry: data.expiry ? new Date(data.expiry) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });
  safeRevalidate('/');
  safeRevalidate('/admin/promotions');
  return result;
}

export async function deleteCoupon(id: string) {
  await prisma.coupon.delete({ where: { id } });
  safeRevalidate('/');
  safeRevalidate('/admin/promotions');
}

export async function createDeal(data: any) {
  const result = await prisma.deal.create({ data });
  safeRevalidate('/');
  safeRevalidate('/admin/promotions');
  return result;
}

export async function deleteDeal(id: string) {
  await prisma.deal.delete({ where: { id } });
  safeRevalidate('/');
  safeRevalidate('/admin/promotions');
}

export async function createNavCategory(data: any) {
  const result = await prisma.navCategory.create({ data });
  safeRevalidate('/');
  safeRevalidate('/admin/promotions');
  return result;
}

export async function deleteNavCategory(id: string) {
  await prisma.navCategory.delete({ where: { id } });
  safeRevalidate('/');
  safeRevalidate('/admin/promotions');
}

export async function getExperienceTiles() {
  return await prisma.experienceTile.findMany();
}

export async function createExperienceTile(data: any) {
  const result = await prisma.experienceTile.create({ data });
  safeRevalidate('/');
  safeRevalidate('/admin/promotions');
  return result;
}

export async function deleteExperienceTile(id: string) {
  await prisma.experienceTile.delete({ where: { id } });
  safeRevalidate('/');
  safeRevalidate('/admin/promotions');
}

export async function getTrendingProducts() {
  return await prisma.trendingProduct.findMany({
    include: { product: true }
  });
}

export async function createTrendingProduct(data: any) {
  const result = await prisma.trendingProduct.create({ data });
  safeRevalidate('/');
  safeRevalidate('/admin/promotions');
  return result;
}

export async function deleteTrendingProduct(id: string) {
  await prisma.trendingProduct.delete({ where: { id } });
  safeRevalidate('/');
  safeRevalidate('/admin/promotions');
}

export async function getDashboardStats() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const [
    orderCount, 
    _productCount, 
    userCount, 
    orders,
    activeVisitorsCount,
    totalVisits,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count(),
    prisma.order.findMany({ include: { items: true } }),
    prisma.trafficRecord.count({
      where: {
        timestamp: { gte: fiveMinutesAgo }
      }
    }),
    prisma.trafficRecord.count(),
  ]);

  const totalRevenue = orders.reduce((sum: number, o: any) => sum + o.total, 0);
  const posRevenue = orders.filter((o: any) => o.source === 'POS').reduce((sum: number, o: any) => sum + o.total, 0);

  // Status-based counts
  const statusCounts = {
    received: orders.filter((o: any) => o.status === 'Pending' || o.status === 'Processing').length,
    packed: orders.filter((o: any) => o.status === 'Packed').length,
    delivered: orders.filter((o: any) => o.status === 'Delivered' || o.status === 'Delivered to Customer').length,
    outForDelivery: orders.filter((o: any) => o.status === 'Out for Delivery').length,
    inTransit: orders.filter((o: any) => o.status === 'In Transit' || o.status === 'Shipped' || o.status === 'Picked Carrier').length,
    returned: orders.filter((o: any) => o.status === 'Returned' || o.status === 'Delivery Failed').length,
    deliveryFailed: orders.filter((o: any) => o.status === 'Delivery Failed').length,
    pendingRefunds: orders.filter((o: any) => (o.status === 'Returned' || o.status === 'Return-Processing' || o.status === 'Returned-With-Driver') && (o.returnStatus === 'PENDING' || o.returnStatus === 'APPROVED')).length,
    completedRefunds: orders.filter((o: any) => o.returnStatus === 'COMPLETED').length,
  };

  // Staff activity counts
  const staffCounts = {
    shipment: await prisma.user.count({ where: { role: 'shipment', isActive: true } }),
    delivery: await prisma.user.count({ where: { role: 'delivery_champion', isActive: true } }),
    shopkeeper: await prisma.user.count({ where: { role: 'shopkeeper', isActive: true } }),
    inventoryManager: await prisma.user.count({ where: { role: 'inventory_manager', isActive: true } }),
  };

  // Staff Performance Data
  const shopkeepers = await prisma.user.findMany({
    where: { role: 'shopkeeper' },
    select: {
      id: true,
      name: true,
      lastName: true,
    }
  });

  const staffPerformance = shopkeepers.map((staff: any) => {
    const staffOrders = (orders as any[]).filter(o => o.sourceStaffId === staff.id);
    return {
      staffId: staff.id,
      name: `${staff.name} ${staff.lastName || ''}`.trim(),
      revenue: staffOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
      orderCount: staffOrders.length
    };
  }).sort((a: any, b: any) => (b.revenue || 0) - (a.revenue || 0));

  // Performance data (daily orders for the last 7 days)
  const last7DaysData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = d.toISOString().split('T')[0];
    const dayOrders = orders.filter((o: any) => o.createdAt.toISOString().split('T')[0] === dateString);
    return {
      date: dateString,
      displayDate: d.toLocaleDateString('en-US', { weekday: 'short' }),
      count: dayOrders.length,
      revenue: dayOrders.reduce((sum: number, o: any) => sum + o.total, 0),
      onlineRevenue: dayOrders.filter((o: any) => o.source !== 'POS').reduce((sum: number, o: any) => sum + o.total, 0),
      offlineRevenue: dayOrders.filter((o: any) => o.source === 'POS').reduce((sum: number, o: any) => sum + o.total, 0),
    };
  }).reverse();
  
  const [recentOrders, inventoryAlerts, recentUsers] = await Promise.all([
     prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { items: true, transaction: true }
      }),
      prisma.product.findMany({
        where: { quantity: { lte: 5 } },
        take: 5,
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      })
  ]);

  return {
    revenue: totalRevenue,
    posRevenue: posRevenue,
    orders: orderCount,
    customers: userCount,
    activeNow: activeVisitorsCount,
    totalVisits,
    uniqueVisitors: activeVisitorsCount,
    statusCounts,
    staffCounts,
    performanceData: last7DaysData,
    recentOrders,
    inventoryAlerts,
    recentUsers,
    staffPerformance,
  };
}

export async function getStoreSettings() {
  trackAction('getStoreSettings');
  let settings = await prisma.storeSettings.findUnique({
    where: { id: 'global' }
  });

  settings ??= await prisma.storeSettings.create({
    data: {
      id: 'global',
      taxEnabled: false,
      taxPercentage: 0,
      taxName: 'GST'
    }
  });

  return settings;
}

export async function updateStoreSettings(data: { 
  taxEnabled: boolean, 
  taxPercentage: number, 
  taxName: string,
  requireDeliveryPhoto?: boolean 
}) {
  trackAction('updateStoreSettings');
  const settings = await prisma.storeSettings.upsert({
    where: { id: 'global' },
    update: {
      taxEnabled: data.taxEnabled,
      taxPercentage: data.taxPercentage,
      taxName: data.taxName,
      requireDeliveryPhoto: data.requireDeliveryPhoto
    },
    create: {
      id: 'global',
      taxEnabled: data.taxEnabled,
      taxPercentage: data.taxPercentage,
      taxName: data.taxName,
      requireDeliveryPhoto: data.requireDeliveryPhoto || false
    }
  });

  safeRevalidate('/admin/settings');
  return settings;
}

export async function getDeliveryChampions() {
  trackAction('getDeliveryChampions');
  return await prisma.user.findMany({
    where: { role: 'delivery_champion' },
    orderBy: { name: 'asc' }
  });
}

export async function createDeliveryChampion(data: { name: string, email: string, phone: string }) {
  trackAction('createDeliveryChampion');
  const user = await prisma.user.create({
    data: {
      ...data,
      role: 'delivery_champion',
      password: 'password123' // Default password
    }
  });
  safeRevalidate('/admin/customers');
  return user;
}

export async function getShipmentOrders(userId?: string) {
  trackAction('getShipmentOrders');
  
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isActive) {
      throw new Error('Unauthorized or account suspended');
    }
  }

  // Shipment users see orders that need packing or handover
  return await prisma.order.findMany({
    where: {
      status: { in: ['Pending', 'Processing', 'Packed', 'Handover'] }
    },
    include: { items: true, assignedDelivery: true },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function getShipmentHistory(userId?: string) {
  trackAction('getShipmentHistory');
  
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isActive) {
      throw new Error('Unauthorized or account suspended');
    }
  }

  // History includes Shipped, Delivered, or Cancelled
  return await prisma.order.findMany({
    where: {
      status: { in: ['Shipped', 'Delivered', 'Cancelled'] }
    },
    include: { items: true, assignedDelivery: true },
    orderBy: { updatedAt: 'desc' },
    take: 50 // Limit history for performance
  });
}

export async function getDeliveryOrders(deliveryId: string) {
  trackAction('getDeliveryOrders');
  
  // Verify user is active
  const user = await prisma.user.findUnique({ where: { id: deliveryId } });
  if (!user?.isActive) {
    throw new Error('Unauthorized or account suspended');
  }

  // Delivery person sees orders assigned to them
  return await prisma.order.findMany({
    where: {
      assignedDeliveryId: deliveryId,
      status: { in: ['Packed', 'Handover', 'Shipped', 'Out for Delivery'] }
    },
    include: { 
      items: true,
      assignedShipment: {
        select: { name: true, phone: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function getDeliveryHistory(deliveryId: string) {
  trackAction('getDeliveryHistory');
  
  // Verify user is active
  const user = await prisma.user.findUnique({ where: { id: deliveryId } });
  if (!user?.isActive) {
    throw new Error('Unauthorized or account suspended');
  }

  // Delivery person sees past deliveries
  return await prisma.order.findMany({
    where: {
      assignedDeliveryId: deliveryId,
      status: { in: ['Delivered', 'Cancelled'] }
    },
    include: { items: true },
    orderBy: { updatedAt: 'desc' },
    take: 50
  });
}

export async function assignOrderToDelivery(orderId: string, deliveryId: string, shipmentId?: string) {
  trackAction('assignOrderToDelivery');
  const handoverCode = Math.floor(1000 + Math.random() * 9000).toString();
  
  return await prisma.$transaction(async (tx: any) => {
    // Check if already packed to avoid double inventory reduction
    const existingOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!existingOrder) throw new Error("Order not found");
    if (existingOrder.status === 'Packed' || existingOrder.status === 'Shipped' || existingOrder.status === 'Delivered') {
      return existingOrder;
    }

    // 1. Reduce Inventory for online order being packed
    await reduceOrderInventory(tx, orderId, 'ONLINE_SALE_PACKED');

    // 2. Update order status
    const order = await tx.order.update({
      where: { id: orderId },
      data: {
        assignedDeliveryId: deliveryId,
        assignedShipmentId: shipmentId,
        handoverCode: handoverCode,
        status: 'Packed',
        statusHistory: {
          create: {
            status: 'Packed',
            note: `Order packed and assigned to delivery champion. Assigned by shipment user: ${shipmentId || 'Unknown'}`
          }
        }
      }
    });

    safeRevalidate('/shipment');
    safeRevalidate('/admin/inventory-logs');
    safeRevalidate('/admin/products');
    return order;
  });
}

export async function markDeliveryFailed(orderId: string, reason: string) {
  trackAction('markDeliveryFailed');
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'Delivery Failed',
      failureReason: reason,
      statusHistory: {
        create: {
          status: 'Delivery Failed',
          note: `Delivery attempt failed. Reason: ${reason}`
        }
      }
    }
  });
  safeRevalidate('/delivery');
  safeRevalidate('/admin/orders');
  return updatedOrder;
}

export async function getStaffUsers() {
  trackAction('getStaffUsers');
  return await prisma.user.findMany({
    where: {
      role: { in: ['shipment', 'delivery_champion', 'shopkeeper', 'inventory_manager'] }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createStaffUser(data: { name: string, lastName: string, email: string, passwordHash: string, role: 'shipment' | 'delivery_champion' | 'shopkeeper' | 'inventory_manager', phone?: string }) {
  trackAction('createStaffUser');
  try {
    // Clean phone number (convert empty to null to avoid unique constraint issues on empty strings)
    const phone = data.phone?.trim() || null;
    const email = data.email.toLowerCase().trim();

    // Check for conflicts first
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(phone ? [{ phone }] : [])
        ]
      }
    });

    if (existing) {
      if (existing.email === email) return { success: false, message: 'An account with this email already exists.' };
      if (existing.phone === phone) return { success: false, message: 'An account with this phone number already exists.' };
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        lastName: data.lastName,
        email,
        password: data.passwordHash,
        role: data.role,
        phone,
        isActive: true
      }
    });
    safeRevalidate('/admin/staff');
    return { success: true, data: user };
  } catch (error: any) {
    console.error('Staff creation error:', error);
    return { success: false, message: error.message || 'Failed to create staff account' };
  }
}

export async function toggleUserStatus(userId: string) {
  trackAction('toggleUserStatus');
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, message: 'User not found' };
    
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive }
    });
    
    safeRevalidate('/admin/staff');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update user status' };
  }
}

export async function deleteUser(userId: string) {
  trackAction('deleteUser');
  // Check if user has orders before deleting, or just set to inactive
  // For simplicity and keeping referential integrity of orders, we delete if no relations exist but usually deactivation is safer.
  // We'll allow deletion but prisma will throw if there are relations if not handled.
  try {
    await prisma.user.delete({ where: { id: userId } });
    safeRevalidate('/admin/staff');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete user, deactivating instead:', error);
    // If has relations, just deactivate
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });
    safeRevalidate('/admin/staff');
    return { success: false, message: 'User has historical data and was deactivated instead of deleted.' };
  }
}

export async function verifyHandover(orderId: string, inputCode: string) {
  trackAction('verifyHandover');
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { handoverCode: true }
  });

  if (order?.handoverCode !== inputCode) {
    throw new Error('Invalid handover code');
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'Shipped',
      statusHistory: {
        create: {
          status: 'Shipped',
          note: 'Handover verified by 4-digit code. Order with delivery champion.'
        }
      }
    }
  });

  safeRevalidate('/shipment');
  safeRevalidate('/delivery');
  return updatedOrder;
}

export async function verifyDeliveryHandover(
  orderId: string, 
  inputOTP: string, 
  paymentStatus?: { collected: boolean }, 
  imagePath?: string
) {
  trackAction('verifyDeliveryHandover');
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { 
      deliveryOTP: true, 
      paymentMethod: true 
    }
  });

  if (order?.deliveryOTP !== inputOTP) {
    throw new Error('Invalid delivery OTP');
  }

  // Check if admin requires a delivery photo
  const settings = await prisma.storeSettings.findUnique({ where: { id: 'global' } });
  if (settings?.requireDeliveryPhoto && !imagePath) {
    throw new Error('Delivery photo is required to complete this delivery.');
  }

  // Mandatory check for COD
  const isCOD = order.paymentMethod?.toLowerCase().includes('cod') || order.paymentMethod?.toLowerCase().includes('cash');
  if (isCOD && !paymentStatus?.collected) {
    throw new Error('Payment must be collected before verifying delivery.');
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'Delivered',
      deliveryImage: imagePath,
      paymentCollected: isCOD ? true : undefined,
      statusHistory: {
        create: {
          status: 'Delivered',
          note: `Delivery confirmed with customer OTP. ${isCOD ? 'Payment collected.' : ''}`
        }
      }
    }
  });

  safeRevalidate('/delivery');
  safeRevalidate('/admin/orders');
  return updatedOrder;
}

export async function uploadDeliveryProof(base64Image: string) {
  trackAction('uploadDeliveryProof');
  return await processDeliveryPhoto(base64Image);
}

export async function updateUserRole(userId: string, role: string) {
  trackAction('updateUserRole');
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role }
  });
  safeRevalidate('/admin/customers');
  return user;
}

export async function updateProductStock(id: string, quantity: number) {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, name: true, quantity: true }
  });

  if (!product) throw new Error("Product not found");

  const diff = quantity - product.quantity;
  
  const result = await prisma.product.update({
    where: { id },
    data: { 
      quantity,
      inStock: quantity > 0
    }
  });

  if (diff !== 0) {
    await prisma.inventoryLog.create({
      data: {
        productId: product.id,
        productName: product.name,
        oldQuantity: product.quantity,
        newQuantity: quantity,
        change: Math.abs(diff),
        type: diff > 0 ? 'RESTOCK' : 'ADJUSTMENT',
      }
    });
  }

  safeRevalidate('/inventory');
  safeRevalidate('/admin/products');
  safeRevalidate('/admin/inventory-logs');
  return result;
}

export async function processRefund(orderId: string, amount: number, method: string) {
  return await prisma.$transaction(async (tx: any) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) throw new Error("Order not found");

    // Restock items if they were part of a refund
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.id },
        data: { quantity: { increment: item.quantity } }
      });
    }

    return await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'Refunded',
        refundAmount: amount,
        refundPaymentMethod: method
      }
    });
  });
}

export async function markTransactionSuccess(orderId: string, paymentMethod: string) {
  // Find if there's an existing transaction
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { transaction: true }
  });

  if (order?.transaction) {
    return await prisma.transaction.update({
      where: { id: order.transaction.id },
      data: {
        status: 'Success',
        paymentMethod: paymentMethod
      }
    });
  } else {
    // Create one if it doesn't exist
    return await prisma.transaction.create({
      data: {
        orderId: orderId,
        status: 'Success',
        paymentMethod: paymentMethod,
        amount: order?.total || 0,
      }
    });
  }
}

export async function createOrUpdateCoupon(data: any) {
  const { id, ...couponData } = data;
  if (id) {
    return await prisma.coupon.update({
      where: { id },
      data: couponData
    });
  } else {
    return await prisma.coupon.create({
      data: couponData
    });
  }
}
