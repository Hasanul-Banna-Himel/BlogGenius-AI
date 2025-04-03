document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const topicInput = document.getElementById('topic');
    const blogLengthSelect = document.getElementById('blog-length');
    const outputSection = document.getElementById('output-section');
    const blogOutput = document.getElementById('blog-output');
    const loadingElement = document.getElementById('loading');
    
    generateBtn.addEventListener('click', async function() {
        const topic = topicInput.value.trim();
        if (!topic) {
            alert('Please enter a topic or keywords');
            return;
        }
        
        // Show loading spinner
        loadingElement.style.display = 'block';
        outputSection.style.display = 'none';
        
        try {
            const response = await fetch('/generate-blog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    topic: topic,
                    length: blogLengthSelect.value
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to generate blog post');
            }
            
            const data = await response.json();
            
            // Convert markdown to HTML
            const formattedContent = markdownToHtml(data.content);
            blogOutput.innerHTML = formattedContent;
            
            // Hide loading, show output
            loadingElement.style.display = 'none';
            outputSection.style.display = 'block';
            
        } catch (error) {
            console.error('Error:', error);
            alert('Error generating blog post. Please try again.');
            loadingElement.style.display = 'none';
        }
    });
    
    copyBtn.addEventListener('click', function() {
        const range = document.createRange();
        range.selectNode(blogOutput);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
        alert('Blog post copied to clipboard!');
    });
    
    downloadBtn.addEventListener('click', function() {
        const content = blogOutput.innerText;
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blog-post-${topicInput.value.replace(/\s+/g, '-').toLowerCase()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    // Simple markdown to HTML converter
    function markdownToHtml(markdown) {
        // Handle headings
        let html = markdown
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            // Handle paragraphs
            .replace(/^(?!<h[1-3]>)(.*$)/gm, function(m) {
                return m.trim() === '' ? '' : '<p>' + m + '</p>';
            })
            // Handle bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Handle italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Handle lists
            .replace(/^\- (.*$)/gm, '<li>$1</li>')
            .replace(/<\/li>\n<li>/g, '</li><li>');
        
        // Wrap lists
        if (html.includes('<li>')) {
            html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
        }
        
        return html;
    }
});