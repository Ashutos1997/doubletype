// Generate SVG files for macOS menu bar
const generateTrayIcons = () => {
  // Template icon (black with transparency) - macOS will handle coloring
  const templateSvg = `<svg width="18" height="18" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="32" y="48" width="80" height="160" rx="8" fill="black"/>
  <rect x="144" y="48" width="80" height="160" rx="8" fill="black"/>
  <rect x="44" y="64" width="56" height="8" rx="2" fill="white" opacity="0.8"/>
  <rect x="44" y="80" width="40" height="8" rx="2" fill="white" opacity="0.6"/>
  <rect x="44" y="96" width="48" height="8" rx="2" fill="white" opacity="0.7"/>
  <rect x="44" y="112" width="32" height="8" rx="2" fill="white" opacity="0.5"/>
  <rect x="44" y="128" width="52" height="8" rx="2" fill="white" opacity="0.6"/>
  <rect x="44" y="144" width="36" height="8" rx="2" fill="white" opacity="0.8"/>
  <rect x="44" y="160" width="44" height="8" rx="2" fill="white" opacity="0.7"/>
  <rect x="44" y="176" width="28" height="8" rx="2" fill="white" opacity="0.5"/>
  
  <rect x="156" y="64" width="56" height="8" rx="2" fill="white" opacity="0.8"/>
  <rect x="156" y="80" width="48" height="8" rx="2" fill="white" opacity="0.6"/>
  <rect x="156" y="96" width="40" height="8" rx="2" fill="white" opacity="0.7"/>
  <rect x="156" y="112" width="52" height="8" rx="2" fill="white" opacity="0.5"/>
  <rect x="156" y="128" width="36" height="8" rx="2" fill="white" opacity="0.6"/>
  <rect x="156" y="144" width="44" height="8" rx="2" fill="white" opacity="0.8"/>
  <rect x="156" y="160" width="32" height="8" rx="2" fill="white" opacity="0.7"/>
  <rect x="156" y="176" width="48" height="8" rx="2" fill="white" opacity="0.5"/>
</svg>`

  // @2x version for Retina displays
  const templateSvg2x = `<svg width="36" height="36" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="32" y="48" width="80" height="160" rx="8" fill="black"/>
  <rect x="144" y="48" width="80" height="160" rx="8" fill="black"/>
  <rect x="44" y="64" width="56" height="8" rx="2" fill="white" opacity="0.8"/>
  <rect x="44" y="80" width="40" height="8" rx="2" fill="white" opacity="0.6"/>
  <rect x="44" y="96" width="48" height="8" rx="2" fill="white" opacity="0.7"/>
  <rect x="44" y="112" width="32" height="8" rx="2" fill="white" opacity="0.5"/>
  <rect x="44" y="128" width="52" height="8" rx="2" fill="white" opacity="0.6"/>
  <rect x="44" y="144" width="36" height="8" rx="2" fill="white" opacity="0.8"/>
  <rect x="44" y="160" width="44" height="8" rx="2" fill="white" opacity="0.7"/>
  <rect x="44" y="176" width="28" height="8" rx="2" fill="white" opacity="0.5"/>
  
  <rect x="156" y="64" width="56" height="8" rx="2" fill="white" opacity="0.8"/>
  <rect x="156" y="80" width="48" height="8" rx="2" fill="white" opacity="0.6"/>
  <rect x="156" y="96" width="40" height="8" rx="2" fill="white" opacity="0.7"/>
  <rect x="156" y="112" width="52" height="8" rx="2" fill="white" opacity="0.5"/>
  <rect x="156" y="128" width="36" height="8" rx="2" fill="white" opacity="0.6"/>
  <rect x="156" y="144" width="44" height="8" rx="2" fill="white" opacity="0.8"/>
  <rect x="156" y="160" width="32" height="8" rx="2" fill="white" opacity="0.7"/>
  <rect x="156" y="176" width="48" height="8" rx="2" fill="white" opacity="0.5"/>
</svg>`

  return { templateSvg, templateSvg2x }
}

export default generateTrayIcons
