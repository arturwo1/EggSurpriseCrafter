// ==UserScript==
// @name         ESC
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Авто-крафтинг без токена через сессию
// @author       arturwol
// @match        https://egg-surprise.shop/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @updateURL    https://raw.githubusercontent.com/arturwo1/EggSurpriseCrafter/main/crafter.js
// @downloadURL  https://raw.githubusercontent.com/arturwo1/EggSurpriseCrafter/main/crafter.js
// ==/UserScript==

(function() {
    'use strict';

    const BASE_URL = "https://egg-surprise.shop/api";
    const CRAFT_URL = `${BASE_URL}/craft/start`;

    let isRunning = false;

    const craftQueue = JSON.parse(localStorage.getItem("craftQueue")) || [];

    function saveCraftQueue() {
        localStorage.setItem("craftQueue", JSON.stringify(craftQueue));
    }

    async function craft(item_id, count) {
        const response = await fetch(CRAFT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"receipt_id": item_id, "count": count})
        });

        if (response.ok) {
            console.log(`✅ Крафт успешен: ${item_id} x ${count}`);
        } else {
            console.error(`❌ Ошибка ${response.status}: ${await response.text()}`);
        }
    }

    async function startCrafting() {
        isRunning = true;
        while (isRunning) {
            for (const item of craftQueue) {
                await craft(item.id, item.count);
                await new Promise(resolve => setTimeout(resolve, item.delay * 1000));
            }
        }
    }

    function stopCrafting() {
        isRunning = false;
    }

    function createUI() {
        const btn = document.createElement("button");
        btn.innerText = "⚒️ Открыть крафт меню";
        btn.style.position = "fixed";
        btn.style.top = "10px";
        btn.style.right = "10px";
        btn.style.zIndex = "9999";
        btn.style.padding = "10px 15px";
        btn.style.backgroundColor = "#f39c12";
        btn.style.color = "white";
        btn.style.border = "none";
        btn.style.borderRadius = "10px";
        btn.style.cursor = "pointer";
        document.body.appendChild(btn);

        btn.addEventListener("click", () => {
            const craftData = prompt("Введите крафт в формате: item_id:count:delay (через запятую)", JSON.stringify(craftQueue));
            if (craftData) {
                try {
                    const items = JSON.parse(craftData);
                    craftQueue.length = 0;
                    craftQueue.push(...items);
                    saveCraftQueue();
                    startCrafting();
                } catch (e) {
                    alert("Неверный формат ввода!");
                }
            }
        });

        const stopBtn = document.createElement("button");
        stopBtn.innerText = "🛑 Остановить";
        stopBtn.style.position = "fixed";
        stopBtn.style.top = "50px";
        stopBtn.style.right = "10px";
        stopBtn.style.zIndex = "9999";
        stopBtn.style.padding = "10px 15px";
        stopBtn.style.backgroundColor = "#e74c3c";
        stopBtn.style.color = "white";
        stopBtn.style.border = "none";
        stopBtn.style.borderRadius = "10px";
        stopBtn.style.cursor = "pointer";
        document.body.appendChild(stopBtn);

        stopBtn.addEventListener("click", stopCrafting);
    }

    createUI();
})();
