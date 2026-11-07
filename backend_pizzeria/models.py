from database import db

class Pedido(db.Model):
    __tablename__ = 'pedidos'
    id = db.Column(db.Integer, primary_key=True)
    nombre_cliente = db.Column(db.String(100))
    direccion = db.Column(db.String(200))
    telefono = db.Column(db.String(20))
    fecha_compra = db.Column(db.Date)
    total = db.Column(db.Numeric(10, 2))
    detalles = db.relationship('DetallePedido', backref='pedido', lazy=True)

class DetallePedido(db.Model):
    __tablename__ = 'detalles_pedido'
    id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedidos.id'))
    tamano = db.Column(db.String(50))
    ingredientes = db.Column(db.Text)
    cantidad = db.Column(db.Integer)
    subtotal = db.Column(db.Numeric(10, 2))