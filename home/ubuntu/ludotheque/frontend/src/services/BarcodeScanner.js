// Service de scan de codes-barres avec QuaggaJS
import Quagga from 'quagga';

class BarcodeScanner {
  constructor() {
    this.isInitialized = false;
    this.isScanning = false;
    this.onDetectedCallback = null;
    this.scannerConfig = {
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: null, // Sera défini lors de l'initialisation
        constraints: {
          width: { min: 640 },
          height: { min: 480 },
          facingMode: "environment",
          aspectRatio: { min: 1, max: 2 }
        }
      },
      locator: {
        patchSize: "medium",
        halfSample: true
      },
      numOfWorkers: navigator.hardwareConcurrency || 4,
      frequency: 10,
      decoder: {
        readers: [
          "ean_reader",
          "ean_8_reader",
          "upc_reader",
          "upc_e_reader",
          "code_128_reader"
        ]
      },
      locate: true
    };
  }

  // Initialiser le scanner
  init(targetElement, onDetectedCallback) {
    if (!targetElement) {
      throw new Error("L'élément cible pour le scanner est requis");
    }

    this.scannerConfig.inputStream.target = targetElement;
    this.onDetectedCallback = onDetectedCallback || this.defaultDetectionHandler;

    return new Promise((resolve, reject) => {
      Quagga.init(
        this.scannerConfig,
        (err) => {
          if (err) {
            console.error("Erreur d'initialisation du scanner:", err);
            reject(err);
            return;
          }

          this.isInitialized = true;
          
          // Ajouter l'écouteur d'événements pour la détection de codes-barres
          Quagga.onDetected(this.handleDetection.bind(this));
          
          // Ajouter l'écouteur d'événements pour le traitement d'image
          Quagga.onProcessed(this.handleProcessed.bind(this));
          
          resolve();
        }
      );
    });
  }

  // Démarrer le scanner
  start() {
    if (!this.isInitialized) {
      throw new Error("Le scanner n'est pas initialisé. Appelez init() d'abord.");
    }

    if (!this.isScanning) {
      Quagga.start();
      this.isScanning = true;
    }
    
    return this.isScanning;
  }

  // Arrêter le scanner
  stop() {
    if (this.isScanning) {
      Quagga.stop();
      this.isScanning = false;
    }
  }

  // Détruire l'instance du scanner
  destroy() {
    this.stop();
    this.isInitialized = false;
    this.onDetectedCallback = null;
  }

  // Gestionnaire par défaut pour les codes-barres détectés
  defaultDetectionHandler(result) {
    console.log("Code-barres détecté:", result.codeResult.code);
  }

  // Gestionnaire pour les codes-barres détectés
  handleDetection(result) {
    if (result && result.codeResult && result.codeResult.code) {
      // Vérifier la fiabilité du résultat
      if (this.validateResult(result)) {
        // Appeler le callback avec le résultat
        if (this.onDetectedCallback) {
          this.onDetectedCallback(result);
        }
      }
    }
  }

  // Valider la fiabilité du résultat
  validateResult(result) {
    // On peut implémenter une logique de validation plus complexe ici
    // Par exemple, vérifier que le même code-barres est détecté plusieurs fois
    return result.codeResult.startInfo.error < 0.25;
  }

  // Gestionnaire pour le traitement d'image
  handleProcessed(result) {
    const drawingCtx = Quagga.canvas.ctx.overlay;
    const drawingCanvas = Quagga.canvas.dom.overlay;

    if (result) {
      // Effacer le canvas
      if (drawingCtx) {
        drawingCtx.clearRect(
          0,
          0,
          parseInt(drawingCanvas.getAttribute("width")),
          parseInt(drawingCanvas.getAttribute("height"))
        );
      }

      // Dessiner les boîtes de localisation si disponibles
      if (result.boxes) {
        drawingCtx.strokeStyle = "green";
        drawingCtx.lineWidth = 2;

        for (let i = 0; i < result.boxes.length; i++) {
          const box = result.boxes[i];
          if (box !== result.box) {
            drawingCtx.beginPath();
            drawingCtx.moveTo(box[0][0], box[0][1]);
            drawingCtx.lineTo(box[1][0], box[1][1]);
            drawingCtx.lineTo(box[2][0], box[2][1]);
            drawingCtx.lineTo(box[3][0], box[3][1]);
            drawingCtx.lineTo(box[0][0], box[0][1]);
            drawingCtx.stroke();
          }
        }
      }

      // Dessiner la boîte de résultat si disponible
      if (result.box) {
        drawingCtx.strokeStyle = "blue";
        drawingCtx.lineWidth = 2;
        drawingCtx.beginPath();
        drawingCtx.moveTo(result.box[0][0], result.box[0][1]);
        drawingCtx.lineTo(result.box[1][0], result.box[1][1]);
        drawingCtx.lineTo(result.box[2][0], result.box[2][1]);
        drawingCtx.lineTo(result.box[3][0], result.box[3][1]);
        drawingCtx.lineTo(result.box[0][0], result.box[0][1]);
        drawingCtx.stroke();
      }

      // Dessiner la ligne de scan si disponible
      if (result.codeResult && result.codeResult.code) {
        drawingCtx.font = "24px Arial";
        drawingCtx.fillStyle = "red";
        drawingCtx.fillText(
          result.codeResult.code,
          10,
          30
        );
      }
    }
  }

  // Changer la caméra (avant/arrière)
  switchCamera() {
    if (!this.isInitialized) {
      throw new Error("Le scanner n'est pas initialisé. Appelez init() d'abord.");
    }

    // Arrêter le scanner actuel
    this.stop();

    // Inverser le mode de la caméra
    const currentFacingMode = this.scannerConfig.inputStream.constraints.facingMode;
    this.scannerConfig.inputStream.constraints.facingMode = 
      currentFacingMode === "environment" ? "user" : "environment";

    // Réinitialiser avec la nouvelle configuration
    return this.init(
      this.scannerConfig.inputStream.target,
      this.onDetectedCallback
    ).then(() => {
      return this.start();
    });
  }

  // Obtenir une image du flux vidéo actuel
  captureImage() {
    if (!this.isInitialized || !this.isScanning) {
      throw new Error("Le scanner doit être initialisé et en cours d'exécution pour capturer une image.");
    }

    const videoElement = document.querySelector('video');
    if (!videoElement) {
      throw new Error("Élément vidéo non trouvé.");
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    return canvas.toDataURL('image/jpeg');
  }
}

export default BarcodeScanner;
