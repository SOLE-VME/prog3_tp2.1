class Sensor {
    static allowedTypes = ['temperature', 'humidity', 'pressure'];
    
    constructor(id, name, type, value, unit, updated_at) {
        if (!Sensor.allowedTypes.includes(type)) {
            throw new Error(`Dato inválido: ${type}. Valores permitidos: ${Sensor.allowedTypes.join(', ')}.`);
        }
        this.id = id;
        this.name = name;
        this.type = type;
        this.value = value;
        this.unit = unit;
        this.updated_at = updated_at;
    }

    set updateValue(newValue) {
        this.value = newValue;
        this.updated_at = new Date().toISOString();
    }
}


const sensor = new Sensor(2, 'Temperatura del Sensor', 'temperature', 23.5, 'C', new Date().toISOString());
console.log(sensor);

sensor.updateValue = 25.0;
console.log(sensor);


class SensorManager {
    constructor() {
        this.sensors = [];
    }

    addSensor(sensor) {
        this.sensors.push(sensor);
    }

    async loadSensors(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Fallo la carga de los sensores: ${response.statusText}`);
            }
            const data = await response.json();
            data.forEach(sensor => {
                const newSensor = new Sensor(
                    sensor.id,
                    sensor.name,
                    sensor.type,
                    sensor.value,
                    sensor.unit,
                    sensor.updated_at
                );
                this.addSensor(newSensor);
            });
            this.render();
        } catch (error) {
            console.error('Error al cargar sensores:', error);
        }
    }

    updateSensor(id) {
        const sensor = this.sensors.find(sensor => sensor.id === id);
        if (sensor) {
            let newValue;
            switch (sensor.type) {
                case 'temperature': // Rango de -30 a 50 grados Celsius
                    newValue = (Math.random() * 80 - 30).toFixed(2);
                    break;
                case 'humidity': // Rango de 0 a 100%
                    newValue = (Math.random() * 100).toFixed(2);
                    break;
                case 'pressure': // Rango de 960 a 1040 hPa (hectopascales o milibares)
                    newValue = (Math.random() * 80 + 960).toFixed(2);
                    break;
                default: // Valor por defecto si el tipo es desconocido
                    newValue = (Math.random() * 100).toFixed(2);
            }
            sensor.updateValue = newValue;
            this.render();
        } else {
            console.error(`Sensor ID ${id} no encontrado`);
        }
    }

    render() {
        const container = document.getElementById("sensor-container");
        container.innerHTML = "";
        this.sensors.forEach(sensor => {
            const sensorCard = document.createElement("div");
            sensorCard.className = "column is-one-third";
            sensorCard.innerHTML = `
                <div class="card">
                    <header class="card-header">
                        <p class="card-header-title">
                            Sensor ID: ${sensor.id}
                        </p>
                    </header>
                    <div class="card-content">
                        <div class="content">
                            <p><strong>Tipo:</strong> ${sensor.type}</p>
                            <p><strong>Valor:</strong> ${sensor.value} ${sensor.unit}</p>
                        </div>
                        <time datetime="${sensor.updated_at}">
                            Última actualización: ${new Date(sensor.updated_at).toLocaleString()}
                        </time>
                    </div>
                    <footer class="card-footer">
                        <a href="#" class="card-footer-item update-button" data-id="${sensor.id}">Actualizar</a>
                    </footer>
                </div>
            `;
            container.appendChild(sensorCard);
        });

        const updateButtons = document.querySelectorAll(".update-button");
        updateButtons.forEach(button => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                const sensorId = parseInt(button.getAttribute("data-id"));
                this.updateSensor(sensorId);
            });
        });
    }
}

const monitor = new SensorManager();
monitor.loadSensors("sensors.json");
