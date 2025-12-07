import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

type AspectRatio = "1:1" | "9:16" | "16:9";

const App = () => {
  const [inputText, setInputText] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError("Por favor, insira o texto sobre cardiologia.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // Prompt optimized for cardiology expertise and Portuguese output
      const prompt = `
        Atue como um especialista em cardiologia e design médico.
        Crie um infográfico profissional, detalhado e visualmente rico explicando o seguinte texto:
        "${inputText}"

        Requisitos:
        1. IDIOMA: Todo o texto no infográfico DEVE estar em PORTUGUÊS.
        2. CONTEÚDO: Utilize terminologia médica correta, baseada em diretrizes de cardiologia. Simplifique conceitos complexos visualmente.
        3. ESTILO: Design limpo, cores médicas (azuis, vermelhos, branco), diagramas claros, ícones relevantes.
        4. FORMATO: O infográfico deve ser autossuficiente e explicativo.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: "1K", // Can upgrade to 2K/4K if supported by account tier
          },
        },
      });

      let foundImage = false;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const base64Image = `data:image/png;base64,${part.inlineData.data}`;
            setGeneratedImage(base64Image);
            foundImage = true;
            break;
          }
        }
      }

      if (!foundImage) {
        throw new Error("Nenhuma imagem foi gerada. Tente novamente.");
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || "Ocorreu um erro ao gerar o infográfico. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "#ef4444" }}
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          <h1 style={styles.title}>CardioGraph AI</h1>
        </div>
        <p style={styles.subtitle}>
          Transforme textos clínicos em infográficos explicativos.
        </p>
      </header>

      <main style={styles.main}>
        <div style={styles.inputSection}>
          <label style={styles.label}>
            Texto Clínico ou Tópico (Cardiologia)
          </label>
          <textarea
            style={styles.textarea}
            placeholder="Ex: Explique a diferença entre IAM com supradesnivelamento e sem supradesnivelamento do segmento ST..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={6}
          />

          <div style={styles.controls}>
            <div style={styles.controlGroup}>
              <label style={styles.label}>Formato do Infográfico</label>
              <div style={styles.formatButtons}>
                <button
                  style={{
                    ...styles.formatBtn,
                    ...(aspectRatio === "16:9" ? styles.formatBtnActive : {}),
                  }}
                  onClick={() => setAspectRatio("16:9")}
                >
                  <span style={styles.iconLandscape}></span>
                  Horizontal
                </button>
                <button
                  style={{
                    ...styles.formatBtn,
                    ...(aspectRatio === "9:16" ? styles.formatBtnActive : {}),
                  }}
                  onClick={() => setAspectRatio("9:16")}
                >
                  <span style={styles.iconPortrait}></span>
                  Vertical
                </button>
                <button
                  style={{
                    ...styles.formatBtn,
                    ...(aspectRatio === "1:1" ? styles.formatBtnActive : {}),
                  }}
                  onClick={() => setAspectRatio("1:1")}
                >
                  <span style={styles.iconSquare}></span>
                  Quadrado
                </button>
              </div>
            </div>
          </div>

          <button
            style={{
              ...styles.generateBtn,
              ...(isLoading || !inputText ? styles.generateBtnDisabled : {}),
            }}
            onClick={handleGenerate}
            disabled={isLoading || !inputText}
          >
            {isLoading ? (
              <span style={styles.loadingText}>
                <span style={styles.spinner}></span> Gerando Infográfico...
              </span>
            ) : (
              "Gerar Infográfico"
            )}
          </button>

          {error && <div style={styles.error}>{error}</div>}
        </div>

        <div style={styles.outputSection}>
          {generatedImage ? (
            <div style={styles.resultContainer}>
              <h3 style={styles.resultTitle}>Infográfico Gerado</h3>
              <div style={styles.imageWrapper}>
                <img
                  src={generatedImage}
                  alt="Infográfico de Cardiologia"
                  style={styles.generatedImage}
                />
              </div>
              <a
                href={generatedImage}
                download={`cardiograph-${Date.now()}.png`}
                style={styles.downloadBtn}
              >
                Baixar Imagem
              </a>
            </div>
          ) : (
            <div style={styles.placeholder}>
              <div style={styles.placeholderIcon}>🖼️</div>
              <p>O infográfico gerado aparecerá aqui.</p>
            </div>
          )}
        </div>
      </main>

      <footer style={styles.footer}>
        <p>Baseado nas diretrizes de cardiologia. Verifique sempre as informações clínicas.</p>
      </footer>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
    paddingBottom: "20px",
    borderBottom: "1px solid #e2e8f0",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "8px",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  subtitle: {
    color: "#64748b",
    fontSize: "1.1rem",
    margin: 0,
  },
  main: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "40px",
  },
  inputSection: {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  label: {
    display: "block",
    fontWeight: "600",
    marginBottom: "10px",
    color: "#334155",
    fontSize: "0.95rem",
  },
  textarea: {
    width: "100%",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "1rem",
    fontFamily: "inherit",
    marginBottom: "24px",
    resize: "vertical",
    outline: "none",
    minHeight: "150px",
    transition: "border-color 0.2s",
  },
  controls: {
    marginBottom: "24px",
  },
  controlGroup: {
    marginBottom: "16px",
  },
  formatButtons: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  formatBtn: {
    flex: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 20px",
    borderRadius: "10px",
    border: "2px solid #e2e8f0",
    backgroundColor: "transparent",
    color: "#64748b",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  formatBtnActive: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
    color: "#ef4444",
  },
  iconLandscape: {
    display: "inline-block",
    width: "20px",
    height: "12px",
    border: "2px solid currentColor",
    borderRadius: "2px",
  },
  iconPortrait: {
    display: "inline-block",
    width: "12px",
    height: "20px",
    border: "2px solid currentColor",
    borderRadius: "2px",
  },
  iconSquare: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid currentColor",
    borderRadius: "2px",
  },
  generateBtn: {
    width: "100%",
    padding: "16px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#ef4444",
    color: "white",
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
    boxShadow: "0 4px 6px -1px rgba(239, 68, 68, 0.3)",
  },
  generateBtnDisabled: {
    backgroundColor: "#94a3b8",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  loadingText: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "3px solid rgba(255,255,255,0.3)",
    borderRadius: "50%",
    borderTopColor: "white",
    animation: "spin 1s ease-in-out infinite",
    display: "inline-block",
  },
  error: {
    marginTop: "16px",
    padding: "12px",
    backgroundColor: "#fef2f2",
    color: "#991b1b",
    borderRadius: "8px",
    border: "1px solid #fecaca",
    fontSize: "0.9rem",
  },
  outputSection: {
    backgroundColor: "#f1f5f9",
    borderRadius: "16px",
    padding: "30px",
    minHeight: "400px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: "2px dashed #cbd5e1",
  },
  placeholder: {
    textAlign: "center",
    color: "#94a3b8",
  },
  placeholderIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  resultContainer: {
    width: "100%",
    textAlign: "center",
  },
  resultTitle: {
    marginBottom: "20px",
    color: "#334155",
  },
  imageWrapper: {
    backgroundColor: "white",
    padding: "10px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    marginBottom: "20px",
    display: "inline-block",
    maxWidth: "100%",
  },
  generatedImage: {
    maxWidth: "100%",
    height: "auto",
    borderRadius: "4px",
    display: "block",
  },
  downloadBtn: {
    display: "inline-block",
    padding: "12px 24px",
    backgroundColor: "#0f172a",
    color: "white",
    textDecoration: "none",
    borderRadius: "8px",
    fontWeight: "600",
    transition: "background-color 0.2s",
  },
  footer: {
    marginTop: "40px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "0.85rem",
  },
};

// Inject CSS animation for spinner
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
