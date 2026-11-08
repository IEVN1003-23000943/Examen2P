import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PizzeriaService, DetallePizza } from '../../services/pizzeria.service';

@Component({
  selector: 'app-pizzeria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pizzeria.html'
})
export class PizzeriaComponent {
  // Datos del cliente
  nombreCliente: string = '';
  direccion: string = '';
  telefono: string = '';
  fechaCompra: string = new Date().toISOString().split('T')[0];

  // Configuración de pizza actual
  tamanoSeleccionado: string = 'Chica';

  // Lista de 12 ingredientes populares
  listaIngredientes: string[] = [
    'Pepperoni', 'Jamón', 'Champiñones', 'Piña',
    'Tocino', 'Salchicha', 'Pimiento', 'Cebolla',
    'Aceitunas', 'Jalapeños', 'Extra Queso', 'Pastor'
  ];

  // Estado de selección de ingredientes
  ingredientes: { [key: string]: boolean } = {
    'Pepperoni': false,
    'Jamón': false,
    'Champiñones': false,
    'Piña': false,
    'Tocino': false,
    'Salchicha': false,
    'Pimiento': false,
    'Cebolla': false,
    'Aceitunas': false,
    'Jalapeños': false,
    'Extra Queso': false,
    'Pastor': false
  };

  numPizzas: number = 1;

  // Carrito/Detalle temporal
  listaDetalles: DetallePizza[] = [];

  // Mensajes de notificación
  mensajeFlash: string | null = null;
  mensajeError: string | null = null;

  // Consultas de ventas
  filtroTipo: 'dia' | 'mes' = 'dia';
  busquedaDia: string = 'lunes';
  busquedaMes: string = 'enero';
  ventasResultado: any[] = [];
  totalAcumuladoConsulta: string = '0';
  detalleSeleccionadoModal: any = null;

  constructor(private pizzeriaService: PizzeriaService) {}

  obtenerIngredientesSeleccionados(): string[] {
    return Object.keys(this.ingredientes).filter(ing => this.ingredientes[ing]);
  }

  calcularSubtotal(tamano: string, numIngredientes: number, cantidad: number): number {
    let base = 0;
    if (tamano === 'Chica') base = 100;
    else if (tamano === 'Mediana') base = 120;
    else if (tamano === 'Grande' || tamano === 'Familiar') base = 150;

    const extraIngredientes = numIngredientes * 10;
    return (base + extraIngredientes) * cantidad;
  }

  agregarPizza(): void {
    const ings = this.obtenerIngredientesSeleccionados();
    if (ings.length === 0) {
      this.mensajeError = 'Selecciona al menos un ingrediente para la pizza.';
      return;
    }
    this.mensajeError = null;

    const subtotal = this.calcularSubtotal(this.tamanoSeleccionado, ings.length, this.numPizzas);

    this.listaDetalles.push({
      tamano: this.tamanoSeleccionado,
      ingredientes: ings,
      cantidad: this.numPizzas,
      subtotal: subtotal
    });

    // Resetear selección de ingredientes y cantidad
    Object.keys(this.ingredientes).forEach(key => this.ingredientes[key] = false);
    this.numPizzas = 1;
  }

  quitarPizza(index: number): void {
    this.listaDetalles.splice(index, 1);
  }

  get totalPedido(): number {
    return this.listaDetalles.reduce((acc, item) => acc + item.subtotal, 0);
  }

  guardarPedido(): void {
    if (!this.nombreCliente || !this.direccion || !this.telefono || !this.fechaCompra) {
      this.mensajeError = 'Por favor completa todos los datos del cliente.';
      return;
    }

    if (this.listaDetalles.length === 0) {
      this.mensajeError = 'Debes agregar al menos una pizza al pedido.';
      return;
    }

    const payload = {
      nombre_cliente: this.nombreCliente,
      direccion: this.direccion,
      telefono: this.telefono,
      fecha_compra: this.fechaCompra,
      total: this.totalPedido,
      pizzas: this.listaDetalles.map(item => ({
        tamano: item.tamano,
        ingredientes: item.ingredientes.join(', '),
        cantidad: item.cantidad,
        subtotal: item.subtotal
      }))
    };

    this.pizzeriaService.crearPedido(payload).subscribe({
      next: (res) => {
        this.mensajeFlash = res.mensaje;
        this.mensajeError = null;
        this.listaDetalles = [];
        this.nombreCliente = '';
        this.direccion = '';
        this.telefono = '';
      },
      error: (err) => {
        this.mensajeError = 'Error al registrar el pedido en el servidor.';
        console.error(err);
      }
    });
  }

  consultarVentas(): void {
    if (this.filtroTipo === 'dia') {
      this.pizzeriaService.obtenerVentasDia(this.busquedaDia).subscribe({
        next: (data) => {
          this.ventasResultado = data.ventas;
          this.totalAcumuladoConsulta = data.total_acumulado;
        }
      });
    } else {
      this.pizzeriaService.obtenerVentasMes(this.busquedaMes).subscribe({
        next: (data) => {
          this.ventasResultado = data.ventas;
          this.totalAcumuladoConsulta = data.total_acumulado;
        }
      });
    }
  }

  verDetalleVenta(id: number): void {
    this.pizzeriaService.obtenerDetallePedido(id).subscribe({
      next: (data) => {
        this.detalleSeleccionadoModal = data;
      }
    });
  }

  cerrarModal(): void {
    this.detalleSeleccionadoModal = null;
  }
}
