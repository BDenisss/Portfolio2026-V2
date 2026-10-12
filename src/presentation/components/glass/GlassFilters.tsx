import { LIQUID_MAP } from './liquid-map'

/**
 * Filtre de réfraction du verre liquide, utilisé dans le `backdrop-filter` de la pastille de sélection sous Chromium
 * (seul moteur qui accepte `url()` dans `backdrop-filter`) : la carte décale ce qui est derrière vers les bords.
 * Unités relatives à la boîte de l'élément : la carte s'étire sur toute la pilule, quelle que soit sa taille.
 */
export function GlassFilters() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <filter id="lg-liquid" primitiveUnits="objectBoundingBox">
          <feImage result="map" width="100%" height="100%" x="0" y="0" href={LIQUID_MAP} />
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.04" result="blur" />
          <feDisplacementMap
            in="blur"
            in2="map"
            scale="0.5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}
