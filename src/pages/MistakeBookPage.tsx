import React, { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { Printer, Trash2, ChevronDown, ChevronUp, CheckSquare, Square, BookOpen } from "lucide-react";
import { MistakeRecord, getAllMistakeRecords, deleteMultipleMistakeRecords } from "@/services/storage";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { cn } from "@/lib/utils";

export function MistakeBookPage() {
  const [records, setRecords] = useState<MistakeRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const data = await getAllMistakeRecords();
      setRecords(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === records.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(records.map((r) => r.id)));
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`确定要删除选中的 ${selectedIds.size} 条记录吗？`)) return;

    try {
      await deleteMultipleMistakeRecords(Array.from(selectedIds));
      setSelectedIds(new Set());
      await loadRecords();
    } catch (error) {
      console.error(error);
      alert("删除失败");
    }
  };

  const handlePrint = () => {
    if (selectedIds.size === 0) {
      alert("请先选择要打印的错题");
      return;
    }
    window.print();
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">加载中...</div>;
  }

  const selectedRecords = records.filter(r => selectedIds.has(r.id));

  return (
    <div className="flex-1 flex flex-col pb-20 lg:pb-0">
      {/* Mobile Header */}
      <header className="lg:hidden bg-surface border-b border-border-color px-4 py-3 flex justify-between items-center sticky top-0 z-10 print:hidden">
        <h1 className="text-lg font-serif font-bold">历史错题本</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDelete}
            disabled={selectedIds.size === 0}
            className="p-2 text-red-600 disabled:text-gray-300 hover:bg-red-50 rounded-full transition-colors"
            title="删除选中"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={handlePrint}
            disabled={selectedIds.size === 0}
            className="flex items-center px-3 py-1.5 bg-ink text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:opacity-80 transition-colors"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            打印 ({selectedIds.size})
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 print:hidden">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 border-b-2 border-ink pb-3 gap-4">
            <h1 className="font-serif text-3xl lg:text-[42px] leading-none hidden lg:block">历史错题本</h1>
            <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
              <button onClick={toggleSelectAll} className="flex items-center text-[13px] font-semibold text-gray-600 hover:text-ink uppercase tracking-widest">
                {selectedIds.size === records.length && records.length > 0 ? (
                  <CheckSquare className="w-4 h-4 mr-1.5 text-ink" />
                ) : (
                  <Square className="w-4 h-4 mr-1.5" />
                )}
                全选
              </button>
              
              {/* Desktop Actions */}
              <div className="hidden lg:flex items-center space-x-4">
                <button
                  onClick={handleDelete}
                  disabled={selectedIds.size === 0}
                  className="text-[13px] font-semibold text-gray-500 hover:text-red-600 disabled:opacity-50 transition-colors flex items-center uppercase tracking-widest"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  删除
                </button>
                <button
                  onClick={handlePrint}
                  disabled={selectedIds.size === 0}
                  className="px-4 py-2 bg-ink text-white text-[13px] font-semibold disabled:opacity-50 hover:opacity-80 transition-colors flex items-center border border-ink"
                >
                  <Printer className="w-4 h-4 mr-1.5" />
                  打印 ({selectedIds.size})
                </button>
              </div>
            </div>
          </div>

          {records.length > 0 ? (
            <div className="space-y-6">
              {records.map((record) => {
                const isSelected = selectedIds.has(record.id);
                const isExpanded = expandedIds.has(record.id);

                return (
                  <div 
                    key={record.id} 
                    className={cn(
                      "bg-white border transition-all relative",
                      isSelected ? "border-ink" : "border-border-color"
                    )}
                  >
                    {/* Card Header */}
                    <div className="p-6 flex items-start cursor-pointer" onClick={() => toggleExpand(record.id)}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(record.id);
                        }}
                        className="mt-1 mr-4 flex-shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-ink" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-block px-3 py-1 bg-[#F0F4EF] text-accent rounded-full text-[12px] font-semibold">
                            {record.knowledgePoint}
                          </span>
                          <span className="text-[11px] uppercase tracking-widest text-gray-400">
                            {format(record.createdAt, "yyyy-MM-dd HH:mm")}
                          </span>
                        </div>
                        <div className="font-serif text-base leading-relaxed text-[#444] line-clamp-2">
                          <MarkdownRenderer content={record.originalQuestion} />
                        </div>
                      </div>
                      <div className="ml-4 mt-1 text-gray-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>

                    {/* Card Body (Expanded) */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-0">
                        <div className="border-t border-border-color pt-6 mt-2">
                          <div className="mb-8">
                            <div className="text-[11px] uppercase tracking-widest text-gray-500 mb-3 font-semibold">原题完整内容</div>
                            <div className="font-serif text-base leading-relaxed text-[#444] bg-paper p-4 border border-border-color">
                              <MarkdownRenderer content={record.originalQuestion} />
                            </div>
                          </div>

                          <div>
                            <div className="text-[11px] uppercase tracking-widest text-gray-500 mb-4 font-semibold">举一反三记录</div>
                            <div className="space-y-6">
                              {record.similarQuestions.map((sq, idx) => (
                                <div key={idx} className="bg-white border border-border-color p-6 relative">
                                  <div className="absolute -top-3 left-5 bg-ink text-white px-2 py-0.5 text-xs font-bold">
                                    相似题 0{idx + 1}
                                  </div>
                                  <div className="text-[15px] leading-relaxed mb-4 text-ink mt-2">
                                    <MarkdownRenderer content={sq.question} />
                                  </div>
                                  
                                  <div className="bg-explanation-bg p-4 border-l-4 border-accent space-y-3">
                                    <div>
                                      <span className="font-bold text-[13px] text-accent mr-2">答案：</span>
                                      <MarkdownRenderer content={sq.answer} className="inline-block text-sm text-gray-800" />
                                    </div>
                                    <div>
                                      <span className="font-bold text-[13px] text-accent mr-2">解析：</span>
                                      <MarkdownRenderer content={sq.explanation} className="inline-block text-sm text-gray-800" />
                                    </div>
                                    <div>
                                      <span className="font-bold text-[13px] text-accent mr-2">易错点：</span>
                                      <MarkdownRenderer 
                                        content={sq.commonMistake} 
                                        className="inline-block text-sm text-[#555] prose-strong:bg-highlight prose-strong:px-1 prose-strong:border-b prose-strong:border-highlight-border prose-strong:font-semibold prose-strong:text-ink" 
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-serif text-lg">错题本空空如也</p>
              <p className="text-[13px] mt-2 uppercase tracking-widest">快去拍照识别错题吧</p>
            </div>
          )}
        </div>
      </main>

      {/* Print View (Hidden on screen, visible on print) */}
      <div className="hidden print:block print:p-8 max-w-4xl mx-auto bg-white text-ink font-sans" ref={printRef}>
        <h1 className="font-serif text-3xl font-bold text-center mb-8 pb-4 border-b-2 border-ink">智学·错题本练习卷</h1>
        
        <div className="space-y-12">
          {selectedRecords.map((record, index) => (
            <div key={record.id} className="break-inside-avoid">
              <div className="mb-4 flex items-center justify-between border-b border-border-color pb-2">
                <h2 className="font-serif text-xl font-bold">错题组 {String(index + 1).padStart(2, '0')}</h2>
                <span className="text-[12px] font-semibold bg-[#F0F4EF] text-accent px-3 py-1 rounded-full">知识点：{record.knowledgePoint}</span>
              </div>
              
              <div className="mb-6">
                <div className="text-[11px] uppercase tracking-widest text-gray-500 mb-2 font-semibold">【原题】</div>
                <div className="font-serif text-base leading-relaxed text-[#444] pl-4 border-l-2 border-border-color">
                  <MarkdownRenderer content={record.originalQuestion} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-[11px] uppercase tracking-widest text-gray-500 mb-2 font-semibold">【举一反三】</div>
                {record.similarQuestions.map((sq, idx) => (
                  <div key={idx} className="pl-4 mb-6">
                    <div className="flex items-start mb-3">
                      <span className="font-bold mr-3 bg-ink text-white px-2 py-0.5 text-xs">0{idx + 1}</span>
                      <div className="flex-1 text-[15px] leading-relaxed">
                        <MarkdownRenderer content={sq.question} />
                      </div>
                    </div>
                    
                    {/* Answers and explanations for print */}
                    <div className="mt-3 pl-9 border-l-2 border-border-color text-sm text-[#555] space-y-2">
                      <div><span className="font-bold text-accent block mb-1 text-[13px]">答案：</span><MarkdownRenderer content={sq.answer} /></div>
                      <div><span className="font-bold text-accent block mb-1 text-[13px]">解析：</span><MarkdownRenderer content={sq.explanation} /></div>
                      <div>
                        <span className="font-bold text-accent block mb-1 text-[13px]">易错点：</span>
                        <MarkdownRenderer 
                          content={sq.commonMistake} 
                          className="prose-strong:bg-highlight prose-strong:px-1 prose-strong:border-b prose-strong:border-highlight-border prose-strong:font-semibold prose-strong:text-ink" 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
