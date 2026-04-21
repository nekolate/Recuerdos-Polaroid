import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController } from '@ionic/angular';

const STORAGE_KEY = 'polaroid_cam_fotos';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  public fotos: any[] = [];
  public fotosFiltradas: any[] = [];
  public filtroBusqueda: string = '';

  constructor(private alertController: AlertController) {}

  ngOnInit() {
    this.cargarFotos();
  }

  private guardarFotos() {
    try {
      const json = JSON.stringify(this.fotos);
      localStorage.setItem(STORAGE_KEY, json);
      const verificacion = localStorage.getItem(STORAGE_KEY);
      const parseado = JSON.parse(verificacion || '[]');
      console.log(`✅ Guardadas ${parseado.length} fotos en localStorage`);
    } catch (error) {
      console.error('❌ Error al guardar fotos:', error);
    }
  }

  private cargarFotos() {
    try {
      const guardadas = localStorage.getItem(STORAGE_KEY);
      if (guardadas) {
        const parsed: any[] = JSON.parse(guardadas);
        this.fotos.splice(0, this.fotos.length, ...parsed);
        console.log(`📂 Cargadas ${this.fotos.length} fotos desde localStorage`);
      }
    } catch (error) {
      console.error('❌ Error al cargar fotos:', error);
      this.fotos.splice(0, this.fotos.length);
    }
    this.filtrarPorFecha();
  }
  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      const ahora = new Date();

      const alert = await this.alertController.create({
        header: 'Añadir descripción',
        inputs: [
          {
            name: 'caption',
            type: 'text',
            placeholder: 'Escribe algo sobre la foto...'
          }
        ],
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Guardar',
            handler: (data) => {
              const nuevaFoto = {
                webviewPath: image.dataUrl,
                texto: data.caption || 'Sin descripción',
                fecha: ahora.toLocaleDateString('es-CO', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }),
                hora: ahora.toLocaleTimeString('es-CO', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }),
                fechaISO: ahora.toISOString().split('T')[0]
              };
              this.fotos.unshift(nuevaFoto);
              this.guardarFotos();
              this.filtrarPorFecha();
            }
          }
        ]
      });

      await alert.present();
    } catch (error) {
      console.log('Cámara cancelada', error);
    }
  }

  async editarTexto(foto: any) {
    const alert = await this.alertController.create({
      header: 'Editar descripción',
      inputs: [
        {
          name: 'caption',
          type: 'text',
          value: foto.texto,
          placeholder: 'Nueva descripción...'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            foto.texto = data.caption || foto.texto;
            this.guardarFotos();
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmarBorrado(foto: any) {
    const alert = await this.alertController.create({
      header: 'Eliminar foto',
      message: '¿Estás seguro de que deseas eliminar esta foto?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            const idx = this.fotos.indexOf(foto);
            if (idx > -1) {
              this.fotos.splice(idx, 1);
              this.guardarFotos();
              this.filtrarPorFecha();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  filtrarPorFecha() {
    const termino = this.filtroBusqueda.trim().toLowerCase();
    if (!termino) {
      this.fotosFiltradas = [...this.fotos];
    } else {
      this.fotosFiltradas = this.fotos.filter(foto =>
        foto.fecha.toLowerCase().includes(termino) ||
        foto.fechaISO.includes(termino)
      );
    }
  }

  limpiarFiltro() {
    this.filtroBusqueda = '';
    this.fotosFiltradas = [...this.fotos];
  }
}
//prueba de relanzamien en git (se han efectuado cmabios en el codigo)

