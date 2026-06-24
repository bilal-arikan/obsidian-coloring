# File Color Picker

Obsidian'da dosya ve klasörleri **native renk seçici** ile renklendiren eklenti.
[obsidian-file-color](https://github.com/ecustic/obsidian-file-color)'dan ilham alır,
ancak önceden tanımlı palet zorunluluğunu kaldırır: sağ tıklayıp **Set color**
dediğinde renk paletinden istediğin yeni rengi seçersin, seçtiğin renkler
otomatik olarak yeniden kullanılabilir bir listeye eklenir.

## Özellikler

- **Sağ tık → Set color**: Dosya/klasör menüsünden native renk seçici (`<input type="color">`) açılır.
- **Büyüyen palet**: Seçtiğin her renk otomatik kaydedilir; sonra grid'den tek tıkla tekrar uygulanır.
- **Sekme başlığı renklendirme**: Renklendirilmiş bir dosyayı açtığında üstteki sekme başlığı ve alt çizgisi o renge boyanır (ayarlardan kapatılabilir).
- **Metin veya arka plan**: Dosya gezgininde metni mi yoksa satır arka planını mı renklendireceğini seç.
- **Alt öğelere yayma (cascade)**: Bir klasör rengini içindeki tüm dosyalara uygula.
- **Ayarlar panelinde palet yönetimi**: Renkleri düzenle, isimlendir, sil.

## Hızlı Kurulum

Eklenti üç dosyadan oluşur — `main.js`, `manifest.json`, `styles.css` — ve her
cihazda `<Vault>/.obsidian/plugins/file-color-picker/` klasöründe bulunmalıdır.

### Seçenek A — BRAT (mobil için önerilir)

1. Obsidian'da **BRAT** community eklentisini kur.
2. BRAT → *Add beta plugin* → `bilal-arikan/obsidian-coloring` gir.
3. BRAT en son GitHub release'ini indirir ve güncel tutar.
4. *Community plugins* altından **File Color Picker**'ı etkinleştir.

> BRAT'ın çalışması için `main.js`, `manifest.json`, `styles.css` içeren bir
> GitHub release gereklidir.

### Seçenek B — Manuel kopyalama

- **Windows:**
  ```powershell
  $dest = "C:\Users\Bilal\Documents\Obsidian Vault\.obsidian\plugins\file-color-picker"
  New-Item -ItemType Directory -Force -Path $dest
  Copy-Item main.js, manifest.json, styles.css $dest
  ```
- **macOS:** üç dosyayı `<Vault>/.obsidian/plugins/file-color-picker/` içine kopyala, sonra eklentiyi etkinleştir.
- **Android:** dosya yöneticisiyle vault içinde aynı klasörü oluştur, üç dosyayı içine kopyala.
- **iOS:** dosyaları Files uygulamasıyla yerleştir (vault *On My iPhone → Obsidian* veya iCloud Drive altında olmalı), sonra etkinleştir.

Ardından Obsidian'da **Settings → Community plugins** altından "File Color Picker"
eklentisini aç. (Community plugins kapalıysa önce "Turn on community plugins" de.)

## Kaynaktan derleme (geliştirici)

```powershell
# 1) Bağımlılıkları kur
cd "C:\Users\Bilal\Desktop\Projects\obsidian-file-color-picker"
npm install

# 2) Production build (main.js üretir)
npm run build
```

Geliştirme sırasında otomatik yeniden derleme için: `npm run dev`.

## Kullanım

1. Dosya gezgininde bir dosya/klasöre **sağ tıkla** → **Set color**.
2. Açılan pencerede:
   - **Saved colors**: Daha önce seçtiğin renklerden birine tıkla.
   - **Pick a new color**: Renk kutusundan yeni renk seç, istersen isim ver, **Add & apply**.
   - **Remove color**: Mevcut rengi kaldır.
3. Renkli bir dosyayı açtığında sekme başlığı da otomatik renklenir.

## Mimari

| Dosya | Sorumluluk |
|------|-----------|
| `src/main.ts` | Eklenti girişi, event kayıtları, ayar yükleme/kaydetme |
| `src/settings.ts` | Ayar tipleri, varsayılanlar, yardımcılar |
| `src/SetColorModal.ts` | Sağ tık renk seçim penceresi |
| `src/colorApplier.ts` | Renkleri dosya gezgini ve sekmelere uygulama |
| `src/SettingsTab.ts` | Ayarlar paneli ve palet yönetimi |
| `src/obsidian-internals.ts` | Public olmayan Obsidian API tipleri |
| `styles.css` | Gezgin, sekme ve modal stilleri |

## Yazar

**Bilal Arikan**
- GitHub: [@bilal-arikan](https://github.com/bilal-arikan)
- Email: bilal1993arikan@gmail.com

## Lisans

[MIT](LICENSE) © Bilal Arikan
