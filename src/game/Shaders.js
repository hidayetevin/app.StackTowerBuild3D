// This shader creates a vertical gradient to give blocks a stylish "glow" or "fade" effect
export const VERTEX_SHADER = `
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
    vPosition = position;
    vNormal = normal;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const FRAGMENT_SHADER = `
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

uniform vec3 colorTop;
uniform vec3 colorBottom;
uniform float opacity;
uniform int patternType; // 0: None, 1: Star, 2: Heart, 3: Moon, 4: Polka

// Helper for patterns
float circle(vec2 uv, float r) {
    return length(uv) - r;
}

// Exact 2D SDF for a Star by Inigo Quilez
float star(vec2 p, float r, int n, float m) {
    // n: points, m: sharpness
    float an = 3.141593 / float(n);
    float en = 3.141593 / m;
    vec2  acs = vec2(cos(an),sin(an));
    vec2  ecs = vec2(cos(en),sin(en)); 
    float bn = mod(atan(p.x,p.y),2.0*an) - an;
    p = length(p)*vec2(cos(bn),abs(sin(bn)));
    p -= r*acs;
    p += ecs*clamp(-dot(p,ecs), 0.0, r*acs.y/ecs.y);
    return length(p)*sign(p.x);
}

void main() {
    vec3 gradientColor = mix(colorBottom, colorTop, vUv.y);
    
    // Optimized lighting
    float ambient = 0.7;
    float directional = max(vNormal.y * 0.3, 0.0); // Simpler lighting calculation
    vec3 lighting = vec3(ambient + directional);
    
    vec3 finalColor = gradientColor;
    float patternMask = 0.0;
    
    // Tiling for patterns
    vec2 tileUV = fract(vUv * 2.0) - 0.5;
    
    if (patternType == 1) { // Star (Using the proper SDF)
        // Flip Y to make the star point upwards correctly
        vec2 p = tileUV * vec2(1.0, -1.0);
        // radius 0.25, 5 points, 3.0 sharpness
        float d = star(p, 0.25, 5, 2.5);
        patternMask = step(d, 0.0);
    } 
    else if (patternType == 2) { // Heart (Apple/Cardioid approximation)
        vec2 p = tileUV * 3.0;
        p.y += 0.45; // Center it visually
        p.x *= 1.1; // Make it beautifully wide
        p.y -= sqrt(abs(p.x)) * 0.7; // The top cleft
        patternMask = step(length(p), 0.85); // Defines the rounded bottom part
    }
    else if (patternType == 3) { // Moon
        float d1 = length(tileUV) - 0.25;
        float d2 = length(tileUV - vec2(0.1, 0.1)) - 0.22;
        patternMask = step(d1, 0.0) * step(0.0, d2);
    }
    else if (patternType == 4) { // Polka Dots
        patternMask = step(length(tileUV), 0.15);
    }
    
    if (patternMask > 0.5) {
        finalColor = mix(finalColor, vec3(1.0), 0.3); // Mix pattern color
    }

    gl_FragColor = vec4(finalColor * lighting, opacity);
}
`;
