const Customer = require('../models/Customer');

// Obter todos os clientes
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Criar um novo cliente
exports.createCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    const savedCustomer = await customer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obter cliente por ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Atualizar cliente
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Deletar cliente
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.status(200).json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Buscar clientes
exports.searchCustomers = async (req, res) => {
  try {
    const searchTerm = req.params.term;
    const customers = await Customer.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } }
      ]
    });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obter pedidos do cliente
exports.getCustomerOrders = async (req, res) => {
  try {
    const Order = require('../models/Order');
    const orders = await Order.find({ customer: req.params.id })
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

