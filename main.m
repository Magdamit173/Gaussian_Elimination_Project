% =========================================================================
% PROJECT: 15-Unknown Linear Equation Solver
% METHOD: Gaussian Elimination with Full Pivoting
% FEATURES: Manual Constant Assignment, Full Pivoting, Symbol-Based UI
% =========================================================================

% --- DATA ---
A = [
    5, 2, 0, 1, 3, -1, 4, 2, 1, 0, 5, -2, 3, 1, 4;
    1, 7, -2, 3, 0, 4, 1, -1, 2, 5, 0, 3, -1, 2, 6;
    3, -1, 8, 2, 5, 1, 0, 4, 3, -2, 1, 6, 4, 0, 2;
    0, 4, 1, 6, -2, 3, 5, 1, 0, 7, -1, 4, 2, 3, 1;
    2, 0, 5, -1, 9, 2, 4, 3, 1, 0, 6, -3, 2, 5, 1;
    -1, 3, 2, 4, 1, 7, 0, 5, 2, 1, -4, 2, 3, 6, 0;
    4, 1, 0, 5, 3, 0, 8, -2, 1, 4, 2, 5, 0, 1, 3;
    2, -1, 4, 1, 2, 5, -2, 9, 3, 0, 1, 4, 6, -2, 1;
    1, 2, 3, 0, 1, 2, 1, 3, 10, -1, 2, 0, 4, 5, 3;
    0, 5, -2, 7, 0, 1, 4, 0, -1, 8, 3, 2, 1, 4, 5;
    5, 0, 1, -1, 6, -4, 2, 1, 2, 3, 11, 0, 5, -1, 2;
    -2, 3, 6, 4, -3, 2, 5, 4, 0, 2, 0, 12, 1, 3, 4;
    3, -1, 4, 2, 2, 3, 0, 6, 4, 1, 5, 1, 10, -2, 1;
    1, 2, 0, 3, 5, 6, 1, -2, 5, 4, -1, 3, -2, 13, 0;
    4, 6, 2, 1, 1, 0, 3, 1, 3, 5, 2, 4, 1, 0, 14
];

B = [15; 22; 8; 12; 30; 5; 18; 10; 45; 20; 11; 33; 25; 14; 50];

% --- SETUP ---
dimension = length(A);
C = arrayfun(@(n) sprintf('X%d', n), 1:dimension, 'UniformOutput', false);
is_singular = false;

% --- MAIN ALGORITHM ---
for i_row = 1:dimension
    % BEAUTIFICATION: Header for each pivot step
    fprintf('\n%s %s PIVOT STEP %s\n', repmat('=', 1, 30), get_ordinal(i_row), repmat('=', 1, 30));
    
    [f_max, f_row, f_col] = obtain_max(A, i_row);

    if abs(f_max) < 1e-12
        fprintf('\n[!] ERROR: Matrix is singular at step %d.\n', i_row);
        is_singular = true;
        break;
    end

    % Swapping
    [A, B] = swap_row(A, B, i_row, f_row);
    display_mat(A, B, C, "After Row Swap", i_row, -1);
    
    [A, C] = swap_column(A, C, i_row, f_col);
    display_mat(A, B, C, "After Column Swap", -1, i_row);

    % Normalizing and Zeroing
    [A, B] = row_pivot_normalize(A, B, i_row);
    display_mat(A, B, C, "After Normalizing (Pivot set to 1.0)", i_row, i_row);
    
    [A, B] = column_pivot_zero(A, B, i_row);
    display_mat(A, B, C, "After Zeroing Below", i_row, i_row);
end

% --- FINAL SOLUTIONS ---
if ~is_singular
    X = back_substitution(A, B);
    [C, X] = reorganized(C, X);

    fprintf('\n%s\n', repmat('*', 1, 50));
    fprintf('           FINAL CALCULATED SOLUTIONS\n');
    fprintf('%s\n', repmat('*', 1, 50));
    for i = 1:length(C)
        fprintf('%s = %8.4f\n', C{i}, X(i));
    end
end

% =========================================================================
% HELPER FUNCTIONS
% =========================================================================

function [l_max, l_row, l_col] = obtain_max(matrix, step)
    l_max = -1; l_row = step; l_col = step;
    n = length(matrix);
    for r = step:n
        for c = step:n
            if abs(matrix(r,c)) > l_max
                l_max = abs(matrix(r,c)); l_row = r; l_col = c;
            end
        end
    end
end

function [A, B] = swap_row(A, B, idxA, idxB)
    A([idxA, idxB], :) = A([idxB, idxA], :);
    B([idxA, idxB]) = B([idxB, idxA]);
end

function [A, C] = swap_column(A, C, idxA, idxB)
    A(:, [idxA, idxB]) = A(:, [idxB, idxA]);
    C([idxA, idxB]) = C([idxB, idxA]);
end

function [A, B] = row_pivot_normalize(A, B, step)
    pivot = A(step, step);
    A(step, step:end) = A(step, step:end) / pivot;
    B(step) = B(step) / pivot;
end

function [A, B] = column_pivot_zero(A, B, step)
    n = length(A);
    for i = (step + 1):n
        factor = A(i, step);
        A(i, step:end) = A(i, step:end) - (factor * A(step, step:end));
        B(i) = B(i) - (factor * B(step));
    end
end

function X = back_substitution(A, B)
    n = length(A);
    X = zeros(n, 1);
    for i = n:-1:1
        X(i) = (B(i) - A(i, i+1:end) * X(i+1:end)) / A(i, i);
    end
end

function [C, X] = reorganized(C, X)
    nums = cellfun(@(s) str2double(s(2:end)), C);
    [~, idx] = sort(nums);
    C = C(idx); X = X(idx);
end

% BEAUTIFICATION FUNCTION
function display_mat(A, B, C, title, h_row, h_col)
    fprintf('\n>>> %s <<<\n', title);
    header = '            '; 
    for i = 1:length(C)
        header = [header, sprintf(' %-10s', C{i})];
    end
    fprintf('%s\n%s\n', header, repmat('-', 1, length(header)));

    for i = 1:size(A, 1)
        % Markers for the active row
        if i == h_row, prefix = 'ACTIVE |'; else, prefix = '       |'; end
        row_str = prefix;
        for j = 1:size(A, 2)
            val = A(i,j);
            % [* *] for Pivot, || || for active columns
            if i == h_row && j == h_col
                row_str = [row_str, sprintf('  [*%8.4f*]', val)];
            elseif j == h_col
                row_str = [row_str, sprintf('  ||%8.4f||', val)];
            else
                row_str = [row_str, sprintf('   %8.4f  ', val)];
            end
        end
        fprintf('%s |  =  %8.4f\n', row_str, B(i));
    end
end

function ord = get_ordinal(n)
    if mod(n, 100) >= 11 && mod(n, 100) <= 13
        s = 'th';
    else
        switch mod(n, 10)
            case 1, s = 'st'; case 2, s = 'nd'; case 3, s = 'rd';
            otherwise, s = 'th';
        end
    end
    ord = [num2str(n), s];
end