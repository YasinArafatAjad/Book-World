// Real Steadfast Courier API integration
const STEADFAST_API_URL = 'https://portal.steadfast.com.bd/api/v1';

// Get access token for Steadfast API
const getSteadfastToken = async () => {
  try {
    const response = await fetch(`${STEADFAST_API_URL}/get_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        api_key: import.meta.env.VITE_STEADFAST_API_KEY,
        secret_key: import.meta.env.VITE_STEADFAST_SECRET_KEY
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get Steadfast access token');
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting Steadfast token:', error);
    throw error;
  }
};

// Check account balance
export const getSteadfastBalance = async () => {
  try {
    const token = await getSteadfastToken();
    
    const response = await fetch(`${STEADFAST_API_URL}/get_balance`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get balance');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting balance:', error);
    throw error;
  }
};

// Create order with Steadfast
export const createSteadfastOrder = async (orderData) => {
  try {
    const token = await getSteadfastToken();
    
    // Calculate total weight (assume 0.5kg per book)
    const totalWeight = orderData.items.reduce((total, item) => total + (item.quantity * 0.5), 0);
    
    const steadfastPayload = {
      invoice: orderData.id,
      recipient_name: orderData.shippingAddress.name,
      recipient_phone: orderData.shippingAddress.phone,
      recipient_address: `${orderData.shippingAddress.street}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zipCode}`,
      cod_amount: Math.round(orderData.total), // Steadfast expects integer
      note: `Book World Order - ${orderData.items.length} books: ${orderData.items.map(item => item.title).join(', ').substring(0, 100)}`,
      
      // Optional fields for better tracking
      recipient_city: orderData.shippingAddress.city,
      recipient_zone: orderData.shippingAddress.state,
      recipient_area: orderData.shippingAddress.city,
      delivery_type: 'regular', // or 'express'
      item_type: 'book',
      special_instruction: orderData.specialInstructions || '',
      item_quantity: orderData.items.reduce((total, item) => total + item.quantity, 0),
      item_weight: totalWeight,
      item_description: orderData.items.map(item => `${item.title} by ${item.author} (Qty: ${item.quantity})`).join('; ').substring(0, 200)
    };

    console.log('Steadfast order payload:', steadfastPayload);

    const response = await fetch(`${STEADFAST_API_URL}/create_order`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(steadfastPayload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Steadfast API Error:', responseData);
      throw new Error(responseData.message || 'Failed to create Steadfast order');
    }

    if (responseData.status !== 200) {
      throw new Error(responseData.message || 'Steadfast order creation failed');
    }
    
    return {
      success: true,
      consignment_id: responseData.consignment.consignment_id,
      tracking_code: responseData.consignment.tracking_code,
      status: responseData.consignment.status,
      message: responseData.message || 'Order successfully submitted to Steadfast Courier'
    };
  } catch (error) {
    console.error('Error creating Steadfast order:', error);
    throw error;
  }
};

// Get order status from Steadfast
export const getSteadfastStatus = async (consignmentId) => {
  try {
    const token = await getSteadfastToken();
    
    const response = await fetch(`${STEADFAST_API_URL}/status_by_cid/${consignmentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to get order status');
    }

    if (responseData.status !== 200) {
      throw new Error(responseData.message || 'Failed to get order status');
    }
    
    return {
      success: true,
      status: responseData.delivery_status,
      tracking_code: responseData.tracking_code,
      consignment_id: responseData.consignment_id,
      current_status: responseData.current_status,
      last_update: responseData.updated_at,
      delivery_fee: responseData.delivery_fee,
      cod_fee: responseData.cod_fee,
      total_fee: responseData.total_fee
    };
  } catch (error) {
    console.error('Error getting Steadfast status:', error);
    throw error;
  }
};

// Bulk status check
export const getSteadfastBulkStatus = async (consignmentIds) => {
  try {
    const token = await getSteadfastToken();
    
    const response = await fetch(`${STEADFAST_API_URL}/bulk_status_by_cid`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        consignment_id: consignmentIds.join(',')
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to get bulk status');
    }
    
    return {
      success: true,
      data: responseData.data
    };
  } catch (error) {
    console.error('Error getting Steadfast bulk status:', error);
    throw error;
  }
};

// Cancel order
export const cancelSteadfastOrder = async (consignmentId) => {
  try {
    const token = await getSteadfastToken();
    
    const response = await fetch(`${STEADFAST_API_URL}/cancel_order`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        consignment_id: consignmentId
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to cancel order');
    }
    
    return {
      success: true,
      message: responseData.message
    };
  } catch (error) {
    console.error('Error cancelling Steadfast order:', error);
    throw error;
  }
};

// Get delivery charge calculation
export const getSteadfastDeliveryCharge = async (recipientCity, codAmount, weight = 0.5) => {
  try {
    const token = await getSteadfastToken();
    
    const response = await fetch(`${STEADFAST_API_URL}/get_delivery_charge`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        recipient_city: recipientCity,
        cod_amount: codAmount,
        weight: weight
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to get delivery charge');
    }
    
    return {
      success: true,
      delivery_fee: responseData.delivery_fee,
      cod_fee: responseData.cod_fee,
      total_fee: responseData.total_fee
    };
  } catch (error) {
    console.error('Error getting delivery charge:', error);
    throw error;
  }
};