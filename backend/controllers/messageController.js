import Message from '../models/Message.js';

// Submit a new contact message
export const submitMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate request body
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required fields: name, email, subject, and message'
      });
    }

    // Create a new message
    const newMessage = await Message.create({
      name,
      email,
      subject,
      message
    });

    return res.status(201).json({
      status: 'success',
      message: 'Your message has been sent successfully. We will get back to you soon!',
      data: {
        message: newMessage
      }
    });
  } catch (error) {
    console.error('Error submitting contact message:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again later.'
    });
  }
};

// Get all messages (for admin)
export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    
    return res.status(200).json({
      status: 'success',
      results: messages.length,
      data: {
        messages
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch messages'
    });
  }
};

// Mark message as read
export const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true, runValidators: true }
    );
    
    if (!message) {
      return res.status(404).json({
        status: 'fail',
        message: 'Message not found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: {
        message
      }
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update message'
    });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findByIdAndDelete(id);
    
    if (!message) {
      return res.status(404).json({
        status: 'fail',
        message: 'Message not found'
      });
    }
    
    return res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete message'
    });
  }
}; 