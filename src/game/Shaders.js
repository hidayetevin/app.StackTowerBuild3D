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
    vec3 gradientColor = mix(colorBottom, colorTop, vUv.y);
    
    // Optimized lighting
    float ambient = 0.7;
    float directional = max(vNormal.y * 0.3, 0.0); // Simpler lighting calculation
    vec3 lighting = vec3(ambient + directional);
    
    vec3 finalColor = gradientColor;
    float patternMask = 0.0;
    
    // Tiling for patterns
    vec2 tileUV = fract(vUv * 2.0) - 0.5;
    
    if (patternType == 1) { // Optimized Star (Using simple logic instead of complex SDF)
        vec2 p = abs(tileUV);
        float d = max(p.x + p.y * 0.5, p.y + p.x * 0.5);
        patternMask = step(d, 0.25);
    } 
    else if (patternType == 2) { // Heart (Simplified)
        vec2 p = tileUV;
        p.y += 0.15;
        float r = length(p);
        patternMask = step(r, 0.25); // Simple circle fallback for ultra-performance
        // Or slightly better heart shape without atan:
        float h = p.x*p.x + (p.y-sqrt(abs(p.x)))*(p.y-sqrt(abs(p.x)));
        patternMask = step(h, 0.15);
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
        finalColor = mix(finalColor, vec3(1.0), 0.3);
    }

    gl_FragColor = vec4(finalColor * lighting, opacity);
}
`;
