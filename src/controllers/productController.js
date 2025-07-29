// Teste temporário para verificar se o problema está no productController

exports.getAllProducts = async (req, res) => {
  res.status(200).json({ message: 'Teste - getAllProducts funcionando' });
};

exports.createProduct = async (req, res) => {
  res.status(200).json({ message: 'Teste - createProduct funcionando' });
};

exports.getProductById = async (req, res) => {
  res.status(200).json({ message: 'Teste - getProductById funcionando' });
};

exports.updateProduct = async (req, res) => {
  res.status(200).json({ message: 'Teste - updateProduct funcionando' });
};

exports.deleteProduct = async (req, res) => {
  res.status(200).json({ message: 'Teste - deleteProduct funcionando' });
};