from flask import Blueprint, request, jsonify
from datetime import datetime
from database import db
from models import Pedido, DetallePedido

pizzeria_bp = Blueprint('pizzeria', __name__)

@pizzeria_bp.route('/pedidos', methods=['POST'])
def crear_pedido():
    data = request.json
    fecha = datetime.strptime(data['fecha_compra'], '%Y-%m-%d').date()
    
    nuevo_pedido = Pedido(
        nombre_cliente=data['nombre_cliente'],
        direccion=data['direccion'],
        telefono=data['telefono'],
        fecha_compra=fecha,
        total=data['total']
    )
    db.session.add(nuevo_pedido)
    db.session.flush()
    
    for item in data['pizzas']:
        detalle = DetallePedido(
            pedido_id=nuevo_pedido.id,
            tamano=item['tamano'],
            ingredientes=item['ingredientes'],
            cantidad=item['cantidad'],
            subtotal=item['subtotal']
        )
        db.session.add(detalle)
    
    db.session.commit()
    return jsonify({
        "mensaje": f"Pedido confirmado. Total a pagar: ${data['total']}", 
        "id": nuevo_pedido.id
    }), 201

@pizzeria_bp.route('/ventas/dia/<dia>', methods=['GET'])
def ventas_por_dia(dia):
    dias_semana = {'lunes': 0, 'martes': 1, 'miercoles': 2, 'jueves': 3, 'viernes': 4, 'sabado': 5, 'domingo': 6}
    dia_idx = dias_semana.get(dia.lower())
    pedidos = Pedido.query.all()
    resultados = [p for p in pedidos if p.fecha_compra.weekday() == dia_idx]
    total_acumulado = sum(p.total for p in resultados)
    
    return jsonify({
        "ventas": [{"id": p.id, "cliente": p.nombre_cliente, "total": str(p.total), "fecha": str(p.fecha_compra)} for p in resultados],
        "total_acumulado": str(total_acumulado)
    }), 200

@pizzeria_bp.route('/ventas/mes/<mes>', methods=['GET'])
def ventas_por_mes(mes):
    meses = {'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8, 'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12}
    mes_idx = meses.get(mes.lower())
    pedidos = Pedido.query.all()
    resultados = [p for p in pedidos if p.fecha_compra.month == mes_idx]
    total_acumulado = sum(p.total for p in resultados)
    
    return jsonify({
        "ventas": [{"id": p.id, "cliente": p.nombre_cliente, "total": str(p.total), "fecha": str(p.fecha_compra)} for p in resultados],
        "total_acumulado": str(total_acumulado)
    }), 200

@pizzeria_bp.route('/pedidos/<int:id>', methods=['GET'])
def detalle_pedido(id):
    pedido = Pedido.query.get_or_404(id)
    detalles = DetallePedido.query.filter_by(pedido_id=id).all()
    
    return jsonify({
        "cliente": pedido.nombre_cliente,
        "fecha": str(pedido.fecha_compra),
        "total": str(pedido.total),
        "pizzas": [{"tamano": d.tamano, "ingredientes": d.ingredientes, "cantidad": d.cantidad, "subtotal": str(d.subtotal)} for d in detalles]
    }), 200