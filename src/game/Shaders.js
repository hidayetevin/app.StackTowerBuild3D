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

void main() {
    // Simple vertical gradient based on UV y-coordinate
    vec3 gradientColor = mix(colorBottom, colorTop, vUv.y);
    
    // Add subtle ambient shading based on normal
    float ambient = 0.8;
    float directional = max(dot(vNormal, vec3(0.5, 1.0, 0.5)), 0.0);
    vec3 lighting = vec3(ambient + directional * 0.2);
    
    gl_FragColor = vec4(gradientColor * lighting, opacity);
}
`;
