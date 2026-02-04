export class ChallengeScreen {
    constructor(challengeManager, analytics, onStartCallback) {
        this.challengeManager = challengeManager;
        this.analytics = analytics;
        this.onStartCallback = onStartCallback;

        this.container = document.createElement('div');
        this.container.id = 'challenge-screen';
        this.container.style.cssText = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(135deg, #2b5876 0%, #4e4376 100%); z-index: 1200; display: none;
            flex-direction: column; align-items: center; justify-content: center;
        `;

        document.body.appendChild(this.container);
    }

    show() {
        const challenge = this.challengeManager.getTodaysChallenge();
        this.render(challenge);
        this.container.style.display = 'flex';
        this.analytics.track('challenge_screen_opened');
    }

    hide() {
        this.container.style.display = 'none';
    }

    render(challenge) {
        if (!challenge) {
            this.container.innerHTML = `<h2 style="color:white;">No Challenge for Today :(</h2><button id="btn-close-chal" style="margin-top:20px;">Back</button>`;
        } else {
            this.container.innerHTML = `
                <h1 style="color:#FFD700; font-family:Arial; margin-bottom:10px;">DAILY CHALLENGE</h1>
                <div style="background:rgba(255,255,255,0.1); padding:30px; border-radius:20px; text-align:center; max-width:300px;">
                    <h2 style="color:white; font-size:28px; margin:0 0 10px 0;">${challenge.name}</h2>
                    <p style="color:#ddd; font-size:18px; margin-bottom:20px;">${challenge.description}</p>
                    
                    <div style="margin:20px 0; border:1px solid rgba(255,255,255,0.3); padding:10px; border-radius:10px;">
                        <div style="color:#aaa; font-size:14px;">REWARD</div>
                        <div style="color:white; font-size:20px; font-weight:bold;">
                            ${challenge.reward.type === 'coins' ? '💰 ' + challenge.reward.amount : '🎁 ' + challenge.reward.id}
                        </div>
                    </div>
                    
                    <button id="btn-start-chal" style="
                        padding:15px 50px; font-size:22px; border:none; border-radius:30px; 
                        background:#FF4081; color:white; cursor:pointer; font-weight:bold;
                        box-shadow: 0 4px 15px rgba(255, 64, 129, 0.4);
                        transition: transform 0.2s;
                    ">START</button>
                </div>
                 <button id="btn-close-chal" style="margin-top:30px; background:none; border:none; color:#aaa; font-size:16px; cursor:pointer; text-decoration:underline;">Close</button>
            `;

            this.container.querySelector('#btn-start-chal').onclick = () => {
                const config = this.challengeManager.startChallenge(challenge);
                this.hide();
                if (this.onStartCallback) this.onStartCallback(config);
            };
        }

        this.container.querySelector('#btn-close-chal').onclick = () => this.hide();
    }
}
