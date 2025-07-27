const Category = require('../models/Category');

// Obter todas as categorias
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Criar uma nova categoria
exports.createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Atualizar categoria
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Deletar categoria
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }
    res.status(200).json({ message: 'Categoria deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
