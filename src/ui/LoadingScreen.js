export class LoadingScreen {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'loading-screen';
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100vw';
        this.container.style.height = '100vh';
        this.container.style.backgroundColor = '#87CEEB';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.alignItems = 'center';
        this.container.style.justifyContent = 'center';
        this.container.style.zIndex = '9999';
        this.container.style.transition = 'opacity 0.5s';

        this.container.innerHTML = `
            <div style="font-size: 32px; font-weight: bold; color: white; margin-bottom: 20px;">STACK TOWER</div>
            <div class="loader" style="
                border: 5px solid #f3f3f3;
                border-top: 5px solid #3498db;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
            "></div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;

        document.body.appendChild(this.container);
    }

    hide() {
        this.container.style.opacity = '0';
        setTimeout(() => {
            this.container.style.display = 'none';
        }, 500);
    }
}
