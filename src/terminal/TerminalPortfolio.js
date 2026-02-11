import { SnakeGame } from './SnakeGame.js';
import { SpaceInvaders } from './SpaceInvaders.js';
import { TetrisGame } from './TetrisGame.js';

export class TerminalPortfolio {
    constructor() {
        this.output = document.getElementById('terminal-output');
        this.input = document.getElementById('terminal-input');
        this.commandHistory = [];
        this.historyIndex = -1;

        this.gameMode = false;
        this.currentGame = null;

        this.init();
    }


    init() {
        // Set up event listeners
        this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Sync input to display span
        this.input.addEventListener('input', () => this.syncInputDisplay());

        // Focus input on click anywhere
        document.addEventListener('click', () => {
            if (this.isMobile) {
                if (!this.gameMode) this.input.focus();
            } else {
                this.input.focus();
            }
        });

        // Mobile Controls
        this.setupMobileControls();

        // Run boot sequence
        this.bootSequence();
    }

    syncInputDisplay() {
        const display = document.getElementById('typed-content');
        if (display) {
            display.textContent = this.input.value;
        }
    }

    setupMobileControls() {
        const controls = document.querySelectorAll('.control-btn');

        controls.forEach(btn => {
            const key = btn.dataset.key;
            if (!key) return;

            // Touch start - simulate keydown
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent scrolling/zooming
                btn.style.transform = 'scale(0.9)';

                // Simulate event for game loop
                if (this.gameMode && this.currentGame) {
                    this.currentGame.handleInput(key);
                }
            }, { passive: false });

            // Touch end - reset style
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                btn.style.transform = 'scale(1)';
            });

            // Click (for testing on desktop with mouse)
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                if (this.gameMode && this.currentGame) {
                    this.currentGame.handleInput(key);
                }
            });
        });
    }

    handleKeyDown(e) {
        if (this.gameMode && this.currentGame) {
            e.preventDefault();
            this.currentGame.handleInput(e.key);
            return;
        }

        if (e.key === 'Enter') {
            const command = this.input.value.trim();
            if (command) {
                this.commandHistory.push(command);
                this.historyIndex = this.commandHistory.length;
                this.executeCommand(command);
            }
            this.input.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.value = this.commandHistory[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                this.input.value = this.commandHistory[this.historyIndex];
            } else {
                this.historyIndex = this.commandHistory.length;
                this.input.value = '';
            }
        }
    }

    executeCommand(command) {
        // Show the command in output
        this.addOutput(`guest@spandan:~$ ${command}`, 'command');

        const [cmd, ...args] = command.toLowerCase().split(' ');

        switch (cmd) {
            case 'help':
                this.cmdHelp();
                break;
            case 'about':
                this.cmdAbout();
                break;
            case 'skills':
                this.cmdSkills();
                break;
            case 'projects':
                this.cmdProjects();
                break;
            case 'experience':
                this.cmdExperience();
                break;
            case 'education':
                this.cmdEducation();
                break;
            case 'contact':
                this.cmdContact();
                break;
            case 'clear':
                this.cmdClear();
                break;
            case 'theme':
                this.cmdTheme(args[0]);
                break;
            case 'sudo':
                this.cmdSudo(args.join(' '));
                break;
            case 'game':
                this.cmdGame(args[0]);
                break;
            case 'whoami':
                this.addOutput('guest - but you could be my next employer! ;)', 'highlight');
                break;
            case 'ls':
                this.addOutput('about.txt  skills.dat  projects/  experience.log  contact.info  snake.exe  defender.exe', '');
                break;
            case 'cat':
                if (args[0]) {
                    this.addOutput(`Reading ${args[0]}... Use specific commands like 'about' or 'skills' instead.`, 'info');
                }
                break;
            default:
                this.addOutput(`Command not found: ${cmd}. Type 'help' for available commands.`, 'error');
        }

        this.scrollToBottom();
    }

    cmdGame(gameName) {
        if (!gameName) {
            this.addOutput('Available Games:', 'highlight');
            this.addOutput('  game snake     (Classic Snake)', 'info');
            this.addOutput('  game defender  (Space Invaders)', 'info');
            this.addOutput('  game tetris    (Block Stacking)', 'info');
            this.addOutput('Usage: game [name]', 'highlight');
            return;
        }

        if (gameName === 'snake') {
            this.addOutput('Starting Snake Game... (Arrows to move, ESC to exit)', 'highlight');
            this.launchGame(SnakeGame);
        } else if (gameName === 'defender') {
            this.addOutput('Starting Packet Defender... (Arrows move, SPACE shoot, ESC exit)', 'highlight');
            this.launchGame(SpaceInvaders);
        } else if (gameName === 'tetris') {
            this.addOutput('Starting Tetris... (Arrows move/rotate, SPACE drop, ESC exit)', 'highlight');
            this.launchGame(TetrisGame);
        } else {
            this.addOutput(`Game '${gameName}' not found. Try 'game snake', 'defender', or 'tetris'.`, 'error');
        }
    }

    launchGame(GameClass) {
        this.gameMode = true;
        document.body.classList.add('game-active');

        // Only blur input on mobile to prevent virtual keyboard
        if (this.isMobile) {
            this.input.blur();
        } else {
            this.input.focus();
        }

        // On mobile, scroll to bottom to ensure game is visible
        if (this.isMobile) {
            setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100);
        }

        this.currentGame = new GameClass(this.output, () => {
            this.gameMode = false;
            document.body.classList.remove('game-active');
            this.currentGame = null;
            this.input.value = '';
            this.input.focus();
            this.addOutput('Game terminated.', 'info');
            this.scrollToBottom();
        });

        this.currentGame.start();
        this.scrollToBottom();
    }

    async bootSequence() {
        await this.typeOutput('Initializing SPANDAN.SYS...', 'info', 50);
        await this.delay(300);
        await this.typeOutput('Loading personality modules...', 'info', 30);
        await this.delay(200);
        await this.typeOutput('Mounting portfolio data...', 'info', 30);
        await this.delay(200);
        await this.typeOutput('System ready.\n', 'info', 30);
        await this.delay(300);

        // ASCII Banner
        this.printBanner();

        await this.delay(200);
        this.addOutput('\nWelcome! Type "help" to see available commands.\n', 'highlight');
    }

    printBanner() {
        if (window.innerWidth < 768) {
            // Mobile Banner (Simplified)
            const mobileBanner = `
  █▀▀ █▀▀█ █▀▀█ █▀▀▄ █▀▀▄ █▀▀█ █▀▀▄
  ▀▀█ █░░█ █▄▄█ █░░█ █░░█ █▄▄█ █░░█
  ▀▀▀ █▀▀▀ ▀░░▀ ▀░░▀ ▀▀▀░ ▀░░▀ ▀░░▀
  
  ┌──────────────────────────────────┐
  │  Dev Portfolio Terminal v1.1     │
  └──────────────────────────────────┘
`;
            this.addOutput(mobileBanner, 'ascii-art');
        } else {
            // Desktop Banner
            const banner = `
 ███████╗██████╗  █████╗ ███╗   ██╗██████╗  █████╗ ███╗   ██╗
 ██╔════╝██╔══██╗██╔══██╗████╗  ██║██╔══██╗██╔══██╗████╗  ██║
 ███████╗██████╔╝███████║██╔██╗ ██║██║  ██║███████║██╔██╗ ██║
 ╚════██║██╔═══╝ ██╔══██║██║╚██╗██║██║  ██║██╔══██║██║╚██╗██║
 ███████║██║     ██║  ██║██║ ╚████║██████╔╝██║  ██║██║ ╚████║
 ╚══════╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝
                                                              
          ┌─────────────────────────────────────┐
          │  DEVELOPER PORTFOLIO TERMINAL v1.1  │
          │  Type 'help' for available commands │
          └─────────────────────────────────────┘
`;
            this.addOutput(banner, 'ascii-art');
        }
    }

    get isMobile() {
        return window.innerWidth < 768;
    }

    cmdHelp() {
        if (this.isMobile) {
            const help = `
 AVAILABLE COMMANDS
 ──────────────────
 about       - Who am I?
 skills      - Technical skills
 projects    - Notable projects
 experience  - Work history
 education   - Academic background
 contact     - Contact info
 game        - Play games
 clear       - Clear screen
 theme       - Change color
 help        - Show this message
`;
            this.addOutput(help, '');
        } else {
            const help = `
╔══════════════════════════════════════════════════════════════╗
║                    AVAILABLE COMMANDS                        ║
╠══════════════════════════════════════════════════════════════╣
║  about       │  Who am I? Personal introduction              ║
║  skills      │  Technical skills & proficiency levels        ║
║  projects    │  Portfolio of notable projects                ║
║  experience  │  Professional work history                    ║
║  education   │  Academic background                          ║
║  contact     │  How to reach me                              ║
║  game        │  Play Terminal Games (Snake/Defender/Tetris)  ║
║  clear       │  Clear the terminal screen                    ║
║  theme       │  Change color (green/amber/white)             ║
║  help        │  Show this help message                       ║
╚══════════════════════════════════════════════════════════════╝
`;
            this.addOutput(help, '');
        }
    }

    cmdAbout() {
        if (this.isMobile) {
            const about = `
 ABOUT ME
 ────────
 Name:     Spandan
 Role:     Full Stack Developer
 Location: India
 
 Hi! I'm a passionate developer who loves building things that
 live on the internet. I specialize in creating web applications
 with clean code and intuitive user experiences.
 
 "Code is poetry written in logic."
`;
            this.addOutput(about, '');
        } else {
            const about = `
┌──────────────────────────────────────────────────────────────┐
│                        ABOUT ME                              │
└──────────────────────────────────────────────────────────────┘

  Name:     Spandan
  Role:     Full Stack Developer
  Location: India
  
  ─────────────────────────────────────────────────────────────
  
  Hi! I'm a passionate developer who loves building things that
  live on the internet. I specialize in creating web applications
  with clean code and intuitive user experiences.
  
  When I'm not coding, you can find me exploring new technologies,
  contributing to open source, or leveling up my skills.
  
  "Code is poetry written in logic."
  
  ─────────────────────────────────────────────────────────────
`;
            this.addOutput(about, '');
        }
    }

    cmdSkills() {
        if (this.isMobile) {
            const skills = `
 TECHNICAL SKILLS
 ────────────────
 LANGUAGES
 • JavaScript   [████████░░] 85%
 • Python       [███████░░░] 75%
 • TypeScript   [███████░░░] 70%
 • Java         [██████░░░░] 60%
 
 FRONTEND
 • React        [████████░░] 85%
 • Vue.js       [███████░░░] 70%
 • HTML/CSS     [█████████░] 90%
 
 BACKEND
 • Node.js      [████████░░] 80%
 • PostalSQL    [███████░░░] 70%
`;
            this.addOutput(skills, '');
        } else {
            const skills = `
┌──────────────────────────────────────────────────────────────┐
│                     TECHNICAL SKILLS                         │
└──────────────────────────────────────────────────────────────┘

  LANGUAGES
  ─────────
  JavaScript   [████████████████████░░░░]  85%
  Python       [██████████████████░░░░░░]  75%
  TypeScript   [████████████████░░░░░░░░]  70%
  Java         [██████████████░░░░░░░░░░]  60%
  
  FRONTEND
  ────────
  React        [████████████████████░░░░]  85%
  Vue.js       [████████████████░░░░░░░░]  70%
  HTML/CSS     [██████████████████████░░]  90%
  Three.js     [██████████████░░░░░░░░░░]  60%
  
  BACKEND
  ───────
  Node.js      [████████████████████░░░░]  80%
  Express      [████████████████████░░░░]  80%
  Django       [██████████████░░░░░░░░░░]  60%
  PostgreSQL   [████████████████░░░░░░░░]  70%
  
  TOOLS
  ─────
  Git          [██████████████████████░░]  90%
  Docker       [██████████████░░░░░░░░░░]  60%
  AWS          [████████████░░░░░░░░░░░░]  55%
`;
            this.addOutput(skills, '');
        }
    }

    cmdProjects() {
        if (this.isMobile) {
            const projects = `
 PROJECTS
 ────────
 [1] RETRO TERMINAL PORTFOLIO
  > CLI-based portfolio website
  > Tech: JS, CSS, HTML
  
 [2] PROJECT ALPHA
  > Full-stack web app
  > Tech: React, Node, SQL
  
 [3] PROJECT BETA
  > Mobile-first app
  > Tech: Vue, Firebase
  
 Use 'contact' to discuss!
`;
            this.addOutput(projects, '');
        } else {
            const projects = `
┌──────────────────────────────────────────────────────────────┐
│                       PROJECTS                               │
└──────────────────────────────────────────────────────────────┘

  [01] RETRO TERMINAL PORTFOLIO
  ─────────────────────────────
  > A CLI-based portfolio website with CRT effects
  > Tech: JavaScript, CSS, HTML
  > Status: You're looking at it!
  
  [02] PROJECT ALPHA
  ──────────────────
  > Full-stack web application
  > Tech: React, Node.js, PostgreSQL
  > Features: Real-time updates, Authentication
  
  [03] PROJECT BETA
  ─────────────────
  > Mobile-first responsive application
  > Tech: Vue.js, Firebase
  > Features: PWA support, Offline mode
  
  [04] PROJECT GAMMA
  ──────────────────
  > Data visualization dashboard
  > Tech: Python, D3.js, Flask
  > Features: Interactive charts, Export data

  ─────────────────────────────────────────────────────────────
  Use 'contact' to discuss any project in detail!
`;
            this.addOutput(projects, '');
        }
    }

    cmdExperience() {
        if (this.isMobile) {
            const experience = `
 WORK EXPERIENCE
 ───────────────
 FULL STACK DEVELOPER
 Company Name | 2023 - Present
 • Built web apps
 • Responsive UI/UX
 
 JUNIOR DEVELOPER
 Previous Company | 2021 - 2023
 • RESTful APIs
 • Frontend components
`;
            this.addOutput(experience, '');
        } else {
            const experience = `
┌──────────────────────────────────────────────────────────────┐
│                    WORK EXPERIENCE                           │
└──────────────────────────────────────────────────────────────┘

  ┌────────────────────────────────────────────────────────────┐
  │ FULL STACK DEVELOPER                                       │
  │ Company Name | 2023 - Present                              │
  ├────────────────────────────────────────────────────────────┤
  │ • Developed and maintained web applications                │
  │ • Collaborated with cross-functional teams                 │
  │ • Implemented responsive UI/UX designs                     │
  │ • Optimized application performance                        │
  └────────────────────────────────────────────────────────────┘
  
  ┌────────────────────────────────────────────────────────────┐
  │ JUNIOR DEVELOPER                                           │
  │ Previous Company | 2021 - 2023                             │
  ├────────────────────────────────────────────────────────────┤
  │ • Built RESTful APIs using Node.js                         │
  │ • Created interactive front-end components                 │
  │ • Participated in agile development processes              │
  └────────────────────────────────────────────────────────────┘
`;
            this.addOutput(experience, '');
        }
    }

    cmdEducation() {
        if (this.isMobile) {
            const education = `
 EDUCATION
 ─────────
 BACHELOR'S DEGREE
 CS / IT | University Name
 
 CERTIFICATIONS
 • AWS Cloud Practitioner
 • MongoDB Developer
 • React Developer
`;
            this.addOutput(education, '');
        } else {
            const education = `
┌──────────────────────────────────────────────────────────────┐
│                      EDUCATION                               │
└──────────────────────────────────────────────────────────────┘

  🎓 BACHELOR'S DEGREE
  ─────────────────────
  Computer Science / Information Technology
  University Name | Graduation Year
  
  Relevant Coursework:
  • Data Structures & Algorithms
  • Database Management Systems
  • Web Development
  • Software Engineering
  • Machine Learning Fundamentals
  
  ─────────────────────────────────────────────────────────────
  
  📜 CERTIFICATIONS
  ─────────────────
  • AWS Cloud Practitioner
  • MongoDB Developer
  • React Developer Certification
`;
            this.addOutput(education, '');
        }
    }

    cmdContact() {
        if (this.isMobile) {
            const contact = `
 CONTACT INFO
 ────────────
 EMAIL:    spandan@example.com
 LINKEDIN: linkedin.com/in/spandan
 GITHUB:   github.com/spandan
 WEB:      spandan.dev
`;
            this.addOutput(contact, '');
        } else {
            const contact = `
┌──────────────────────────────────────────────────────────────┐
│                    CONTACT INFO                              │
└──────────────────────────────────────────────────────────────┘

  📧 EMAIL
     spandan@example.com
  
  💼 LINKEDIN
     linkedin.com/in/spandan
  
  🐙 GITHUB
     github.com/spandan
  
  🌐 PORTFOLIO
     spandan.dev
  
  ─────────────────────────────────────────────────────────────
  
  💬 Let's connect! I'm always open to discussing:
     • New opportunities
     • Interesting projects
     • Tech collaborations
     
  Response time: Usually within 24 hours ⚡
`;
            this.addOutput(contact, '');
        }
    }

    cmdClear() {
        this.output.innerHTML = '';
    }

    cmdTheme(theme) {
        const wrapper = document.getElementById('terminal-wrapper');
        wrapper.classList.remove('theme-green', 'theme-white');

        if (theme === 'amber') {
            // Default amber, remove other classes
            this.addOutput('Theme changed to amber (default).', 'info');
        } else if (theme === 'white') {
            wrapper.classList.add('theme-white');
            this.addOutput('Theme changed to white.', 'info');
        } else if (theme === 'green') {
            wrapper.classList.add('theme-green');
            this.addOutput('Theme changed to green.', 'info');
        } else {
            this.addOutput('Usage: theme [amber|green|white]', 'info');
        }
    }

    cmdSudo(args) {
        if (args === 'hire-me') {
            this.addOutput(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🎉 CONGRATULATIONS! You've unlocked the secret command!   ║
║                                                              ║
║   I'd love to work with you!                                 ║
║   Let's build something amazing together.                    ║
║                                                              ║
║   Email me: spandan@example.com                              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`, 'highlight');
        } else {
            this.addOutput('Nice try, but you need root privileges for that!', 'error');
        }
    }

    addOutput(text, className = '') {
        const line = document.createElement('div');
        line.className = `output-line ${className}`;
        line.textContent = text;
        this.output.appendChild(line);
        this.scrollToBottom();
    }

    async typeOutput(text, className = '', speed = 30) {
        const line = document.createElement('div');
        line.className = `output-line ${className}`;
        this.output.appendChild(line);

        for (let char of text) {
            line.textContent += char;
            this.scrollToBottom();
            await this.delay(speed);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    scrollToBottom() {
        this.output.scrollTop = this.output.scrollHeight;
    }
}
