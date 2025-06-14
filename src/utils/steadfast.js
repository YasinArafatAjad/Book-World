// Steadfast Courier API integration
const STEADFAST_API_URL = 'https://portal.steadfast.com.bd/api/v1';

export const createSteadfastOrder = async (orderData) => {
  try {
    const steadfastPayload = {
      invoice: orderData.id,
      recipient_name: orderData.shippingAddress.name,
      recipient_phone: orderData.shippingAddress.phone,
      recipient_address: `${orderData.shippingAddress.street}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zipCode}`,
      cod_amount: orderData.total,
      note: `Order from Book World - ${orderData.items.length} items`,
    };

    // For demo purposes, we'll simulate the API call
    // In production, you would make an actual API call to Steadfast
    console.log('Steadfast order payload:', steadfastPayload);
    
    // Simulate API response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      consignment_id: `SF${Date.now()}`,
      tracking_code: `SF${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      message: 'Order successfully submitted to Steadfast Courier'
    };
  } catch (error) {
    console.error('Error creating Steadfast order:', error);
    throw new Error('Failed to create Steadfast courier order');
  }
};

export const getSteadfastStatus = async (consignmentId) => {
  try {
    // Simulate API call to get delivery status
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const statuses = ['pending', 'in_transit', 'delivered', 'cancelled'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      success: true,
      status: randomStatus,
      tracking_code: consignmentId,
      last_update: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting Steadfast status:', error);
    throw new Error('Failed to get courier status');
  }
};