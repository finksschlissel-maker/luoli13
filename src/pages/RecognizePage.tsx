import React, { useState, useRef } from "react";
import { Upload, Loader2, RefreshCw, Save, CheckCircle2 } from "lucide-react";
import { extractTextFromImage, extractKnowledgePoint, generateSimilarQuestions, SimilarQuestion } from "@/services/gemini";
import { saveMistakeRecord } from "@/services/storage";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function RecognizePage() {
  const [image, setImage] = useState<string | null>(null);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [isExtractingKnowledge, setIsExtractingKnowledge] = useState(false);
  const [knowledgePoint, setKnowledgePoint] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [similarQuestions, setSimilarQuestions] = useState<SimilarQuestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset state
    setQuestionText("");
    setKnowledgePoint("");
    setSimilarQuestions([]);
    setSaveSuccess(false);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);

    // Extract text
    setIsExtractingText(true);
    try {
      const text = await extractTextFromImage(file);
      setQuestionText(text);
      
      // Auto extract knowledge point
      setIsExtractingKnowledge(true);
      try {
        const kp = await extractKnowledgePoint(text);
        setKnowledgePoint(kp);
      } catch (error) {
        console.error(error);
        alert("知识点提取失败，您可以手动输入");
      } finally {
        setIsExtractingKnowledge(false);
      }
      
    } catch (error) {
      console.error(error);
      alert("图片识别失败，请重试或手动输入");
    } finally {
      setIsExtractingText(false);
    }
  };

  const handleGenerate = async () => {
    if (!questionText.trim() || !knowledgePoint.trim()) {
      alert("请先完善题目内容和知识点");
      return;
    }

    setIsGenerating(true);
    try {
      const questions = await generateSimilarQuestions(knowledgePoint, questionText);
      setSimilarQuestions(questions);
    } catch (error) {
      console.error(error);
      alert("生成失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!questionText || !knowledgePoint || similarQuestions.length === 0) return;
    
    setIsSaving(true);
    try {
      await saveMistakeRecord({
        originalQuestion: questionText,
        knowledgePoint,
        similarQuestions,
      });
      setSaveSuccess(true);
      setTimeout(() => {
        navigate("/mistakes");
      }, 1500);
    } catch (error) {
      console.error(error);
      alert("保存失败");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden pb-20 lg:pb-0">
      {/* Mobile Header */}
      <div className="lg:hidden bg-surface border-b border-border-color sticky top-0 z-10">
        <h1 className="text-lg font-serif font-bold text-center py-4">错题识别</h1>
      </div>

      {/* Left Column */}
      <aside className="bg-surface lg:w-[380px] lg:flex-shrink-0 lg:border-r border-border-color p-6 lg:p-8 flex flex-col lg:overflow-y-auto">
        <div className="text-[11px] uppercase tracking-widest text-gray-500 mb-3 font-semibold">识别数据源</div>
        
        {/* Upload Area */}
        <div 
          className="w-full h-[200px] border border-border-color rounded mb-6 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
          style={{ backgroundImage: image ? 'none' : 'repeating-linear-gradient(45deg, #f5f5f5, #f5f5f5 10px, #ffffff 10px, #ffffff 20px)' }}
          onClick={() => fileInputRef.current?.click()}
        >
          {image ? (
            <img src={image} alt="Uploaded" className="w-full h-full object-contain" />
          ) : (
            <div className="flex flex-col items-center text-gray-500 z-10 bg-white/80 p-2 rounded">
              <Upload className="w-6 h-6 mb-1" />
              <p className="text-xs font-medium">点击拍照或上传图片</p>
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
        </div>

        {/* Recognition Result */}
        {(isExtractingText || questionText) && (
          <div className="space-y-6">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-gray-500 mb-3 font-semibold flex items-center justify-between">
                原题文本回顾
                {isExtractingText && <Loader2 className="w-3 h-3 animate-spin text-accent" />}
              </div>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="识别出的题目内容将显示在这里..."
                className="w-full h-32 p-3 border border-border-color bg-transparent focus:outline-none focus:border-ink resize-none font-serif text-base leading-relaxed text-[#444]"
                disabled={isExtractingText}
              />
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-widest text-gray-500 mb-3 font-semibold flex items-center justify-between">
                核心知识点
                {isExtractingKnowledge && <Loader2 className="w-3 h-3 animate-spin text-accent" />}
              </div>
              <input
                type="text"
                value={knowledgePoint}
                onChange={(e) => setKnowledgePoint(e.target.value)}
                placeholder="例如：一元二次方程"
                className="w-full p-3 border border-border-color bg-transparent focus:outline-none focus:border-ink text-sm font-semibold text-accent"
                disabled={isExtractingKnowledge}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !questionText || !knowledgePoint || isExtractingText || isExtractingKnowledge}
              className="w-full py-3 border border-ink bg-transparent text-ink font-semibold text-sm hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI 实时生成中...
                </>
              ) : (
                "生成举一反三"
              )}
            </button>
          </div>
        )}
      </aside>

      {/* Right Column */}
      <section className="flex-1 p-6 lg:p-10 flex flex-col lg:overflow-y-auto bg-paper">
        {similarQuestions.length > 0 ? (
          <div className="max-w-3xl mx-auto w-full">
            <div className="flex justify-between items-end mb-8 border-b-2 border-ink pb-3">
              <h1 className="font-serif text-3xl lg:text-[42px] leading-none">举一反三 <span className="text-lg text-gray-400 font-sans ml-2">01/03</span></h1>
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="text-[11px] uppercase tracking-widest text-gray-500 hover:text-ink disabled:opacity-50 flex items-center font-semibold"
              >
                <RefreshCw className={cn("w-3 h-3 mr-1", isGenerating && "animate-spin")} />
                重新生成
              </button>
            </div>

            {similarQuestions.map((sq, index) => (
              <div key={index} className="bg-white border border-border-color p-6 lg:p-8 mb-6 relative">
                <div className="absolute -top-3 left-5 bg-ink text-white px-2 py-0.5 text-xs font-bold">
                  相似题 0{index + 1}
                </div>
                
                <div className="text-[15px] leading-relaxed mb-5 text-ink">
                  <MarkdownRenderer content={sq.question} />
                </div>
                
                <div className="bg-explanation-bg p-4 lg:p-5 border-l-4 border-accent space-y-4">
                  <div>
                    <div className="font-bold text-[13px] text-accent mb-2">正确答案</div>
                    <MarkdownRenderer content={sq.answer} className="text-sm text-gray-800" />
                  </div>
                  
                  <div>
                    <div className="font-bold text-[13px] text-accent mb-2">解析</div>
                    <MarkdownRenderer content={sq.explanation} className="text-sm text-gray-800" />
                  </div>

                  <div>
                    <div className="font-bold text-[13px] text-accent mb-2">易错点分析</div>
                    <div className="text-sm text-[#555] leading-relaxed">
                      <MarkdownRenderer 
                        content={sq.commonMistake} 
                        className="prose-strong:bg-highlight prose-strong:px-1 prose-strong:border-b prose-strong:border-highlight-border prose-strong:font-semibold prose-strong:text-ink" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSave}
                disabled={isSaving || saveSuccess}
                className={cn(
                  "px-6 py-3 font-semibold text-sm transition-all border border-ink flex items-center justify-center",
                  saveSuccess ? "bg-accent text-white border-accent" : "bg-ink text-white hover:opacity-80",
                  isSaving && "opacity-75 cursor-not-allowed"
                )}
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    已保存至错题本
                  </>
                ) : isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    保存至错题本
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 font-serif text-lg">
            {isGenerating ? "AI 实时生成中..." : "等待生成举一反三..."}
          </div>
        )}
      </section>
    </div>
  );
}
