import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DetallePizza {
  tamano: string;
  ingredientes: string[];
  cantidad: number;
  subtotal: number;
}

export interface PedidoPayload {
  nombre_cliente: string;
  direccion: string;
  telefono: string;
  fecha_compra: string;
  total: number;
  pizzas: {
    tamano: string;
    ingredientes: string;
    cantidad: number;
    subtotal: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class PizzeriaService {
  private baseUrl = 'http://127.0.0.1:5000/api';

  constructor(private http: HttpClient) {}

  crearPedido(pedido: PedidoPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/pedidos`, pedido);
  }

  obtenerVentasDia(dia: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/ventas/dia/${dia}`);
  }

  obtenerVentasMes(mes: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/ventas/mes/${mes}`);
  }

  obtenerDetallePedido(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/pedidos/${id}`);
  }
}
