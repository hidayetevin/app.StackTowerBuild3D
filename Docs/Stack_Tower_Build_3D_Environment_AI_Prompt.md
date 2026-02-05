
# AI PROMPT — Stack Tower Build 3D  
## Yerden Uzaya Yükselme Sahne Sistemi (Three.js)

Sen deneyimli bir senior mobile game developer’sın.  
Three.js kullanarak mobil (Android + iOS) uyumlu, performans odaklı bir **Stack Tower Build 3D** oyunu geliştiriyorsun.

Bu prompt’ta senden **sadece çevresel sahne sistemini** kurmanı istiyorum.  
Kule yerden başlayacak ve yükseldikçe oyuncu gerçekten yukarı çıktığını hissedecek.

---

## 🎯 OYUNSAL HEDEF

- Oyun yeryüzünde başlar  
- Ekranın alt %10’unda çimen (ground) bulunur  
- Çimenlerin üzerinde gökyüzü vardır  
- Gökyüzünde hafif hareket eden bulutlar bulunur  
- Kule yükseldikçe:
  - Çimenler ekranın altından kaybolur  
  - Bulutlar aşağı doğru hareket eder  
  - Oyuncu yerden yükseldiğini hisseder  
- Kamera **sabit** kalır  
- Dünya (environment) aşağı kayar  

---

## 🧱 SAHNE MİMARİSİ

### World Group Yapısı
Aşağıdaki objeleri tek bir `THREE.Group` altında topla:

- Ground (çimen)  
- CloudGroup (bulutlar)  
- İleride eklenecek sky / space objeleri  

```js
const worldGroup = new THREE.Group();
scene.add(worldGroup);
```

Kamera bu gruba dahil **olmayacak**.

---

## 🌱 GROUND (ÇİMEN)

- `PlaneGeometry` kullan  
- Yatay zemin  
- Renk: çimen yeşili  
- Başlangıçta ekranın alt kısmını kaplayacak şekilde konumlandır  

```js
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 20),
  new THREE.MeshLambertMaterial({ color: 0x3fa34d })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
worldGroup.add(ground);
```

---

## ☁️ GÖKYÜZÜ & BULUT SİSTEMİ

### Gökyüzü
- `scene.background` kullan  
- Açık mavi renk veya hafif gradient  

```js
scene.background = new THREE.Color(0x87ceeb);
```

### Bulutlar
- Sprite veya `PlaneGeometry`  
- Transparent texture  
- 5–10 adet  
- Rastgele X ve Y konumu  
- Z ekseni kameranın arkasında  

```js
const cloudGroup = new THREE.Group();
worldGroup.add(cloudGroup);
```

---

## 🧠 YÜKSELME MEKANİĞİ

### Kule Yüksekliği Referansı

```js
const towerHeight = blocks.length * blockHeight;
```

### Dünya Kaydırma

```js
worldGroup.position.y = -towerHeight * 0.5;
```

Kamera sabit kalır, dünya aşağı kayar.

---

## 🌿 ÇİMENLERİN KAYBOLMASI

```js
if (towerHeight > 5) {
  ground.position.y = THREE.MathUtils.lerp(
    ground.position.y,
    -20,
    0.02
  );
}
```

---

## ☁️ BULUT HAREKETİ

```js
clouds.forEach(cloud => {
  cloud.position.y -= towerHeight * 0.001;

  if (cloud.position.y < -10) {
    cloud.position.y = 20 + Math.random() * 10;
  }
});
```

---

## 📱 PERFORMANS KURALLARI

- Mobile-first  
- Shader-heavy çözümler kullanma  
- Volumetric cloud yapma  
- Düşük obje sayısı  
- Sadece position güncellemeleri  

---

## 🔮 GELECEĞE AÇIK TASARIM

Bu sistem aşağıdakilere hazır olmalı:

```js
if (towerHeight > 50) setTheme("upperSky");
if (towerHeight > 100) setTheme("space");
```

- Tema geçişleri  
- Uzay arka planı  
- Yıldız particle’ları  

---

## ✅ BEKLENEN ÇIKTI

- Three.js sahne kodu  
- WorldGroup mantığı  
- Ground + Cloud sistemi  
- Yükselme hissi veren çalışan örnek  
- Temiz, modüler, okunabilir kod  
- Mobil performans öncelikli yapı  
