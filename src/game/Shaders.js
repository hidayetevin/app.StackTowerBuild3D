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

float heart(vec2 p) {
    p.y -= 0.3; // Center adjustment
    float a = atan(p.x, p.y)/3.141593;
    float r = length(p);
    float h = abs(p.x);
    return r - (0.5 + 0.2*p.y + 0.1*sin(15.0*a)); 
    // Simplified heart approximation SDF
    // Alternatively: (x^2+y^2-1)^3 - x^2*y^3 = 0
}

void main() {
    // Simple vertical gradient based on UV y-coordinate
    vec3 gradientColor = mix(colorBottom, colorTop, vUv.y);
    
    // Add subtle ambient shading based on normal
    float ambient = 0.8;
    float directional = max(dot(vNormal, vec3(0.5, 1.0, 0.5)), 0.0);
    vec3 lighting = vec3(ambient + directional * 0.2);
    
    // Pattern Logic
    vec3 finalColor = gradientColor;
    float patternMask = 0.0;
    
    // Only apply patterns to Top/Bottom faces or Side faces?
    // Let's apply effectively on all, relying on UVs.
    // Tile UVs for repeating patterns
    vec2 tileUV = fract(vUv * 2.0) - 0.5; // 2x2 tiling
    
    if (patternType == 1) { // Star
        float d = star(tileUV, 0.25, 5, 3.0);
        patternMask = 1.0 - smoothstep(0.0, 0.02, d);
    } 
    else if (patternType == 2) { // Heart (Approximated circle/shape for MVP)
        // Better heart SDF:
        vec2 p = tileUV;
        p.y += 0.2;
        float r = length(p);
        // Stick to simpler shape if complex math fails in WebGL1, assuming basic circle first
        // Or simple Heart:
        p.x *= 1.2;
        p.y = -p.y * 1.2 + 0.3;
        float h = p.x*p.x + p.y*p.y - 0.15;
        patternMask = step(h * h * h, p.x*p.x * p.y*p.y*p.y);
    }
    else if (patternType == 3) { // Moon (Circle minus offset circle)
        float d1 = length(tileUV) - 0.3;
        float d2 = length(tileUV - vec2(0.15, 0.1)) - 0.25;
        // Moon is intersection of d1 < 0 and d2 > 0
        float m1 = 1.0 - smoothstep(0.0, 0.02, d1);
        float m2 = 1.0 - smoothstep(0.0, 0.02, d2);
        patternMask = m1 * (1.0 - m2);
    }
    else if (patternType == 4) { // Polka Dots
        float d = length(tileUV) - 0.2;
        patternMask = 1.0 - smoothstep(0.0, 0.02, d);
    }
    
    // Mix pattern color (white-ish or lighter/darker)
    if (patternMask > 0.5) {
        finalColor = mix(finalColor, vec3(1.0, 1.0, 1.0), 0.5); // Add white tint
    }

    gl_FragColor = vec4(finalColor * lighting, opacity);
}
`;
